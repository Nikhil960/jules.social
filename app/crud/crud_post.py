from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models
from .. import schemas

def get_post(db: Session, post_id: int) -> Optional[models.Post]:
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def get_posts_by_workspace(
    db: Session, 
    workspace_id: int, 
    skip: int = 0, 
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[models.Post]:
    query = db.query(models.Post).filter(models.Post.workspace_id == workspace_id)
    if start_date:
        query = query.filter(models.Post.scheduled_at >= start_date)
    if end_date:
        query = query.filter(models.Post.scheduled_at <= end_date)
    return query.offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.PostCreateData, author_id: Optional[int] = None) -> models.Post:
    db_post = models.Post(
        workspace_id=post.workspace_id,
        connected_account_id=post.connected_account_id,
        content_text=post.content_text,
        media_url=str(post.media_url) if post.media_url else None,
        status=post.status,
        scheduled_at=post.scheduled_at,
        author_id=author_id # Can be set here
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post_update: schemas.PostUpdate) -> Optional[models.Post]:
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    
    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int) -> Optional[models.Post]:
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    # Add logic here: only allow deletion if post is 'draft' or 'scheduled', not 'posted' or 'error'
    # For now, we'll allow deletion regardless of status for simplicity.
    db.delete(db_post)
    db.commit()
    return db_post

def update_post_status(db: Session, post_id: int, status: models.PostStatus, error_message: Optional[str] = None, platform_post_id: Optional[str] = None) -> Optional[models.Post]:
    db_post = get_post(db, post_id)
    if not db_post:
        return None
    db_post.status = status
    if status == models.PostStatus.POSTED:
        db_post.posted_at = datetime.utcnow()
        db_post.error_message = None # Clear previous errors if any
        db_post.platform_post_id = platform_post_id
    elif status == models.PostStatus.ERROR:
        db_post.error_message = error_message
    db.commit()
    db.refresh(db_post)
    return db_post