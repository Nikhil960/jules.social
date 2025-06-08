from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import crud, models, schemas
from ..database import get_db
from ..core.celery_app import publish_post_task
# from ..dependencies import get_current_active_user # To be created for auth

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
    # dependencies=[Depends(get_current_active_user)], # Uncomment when auth is ready
    responses={404: {"description": "Not found"}},
)

# Note: The POST endpoint is workspace-specific as per requirements
# POST /api/v1/workspaces/{workspace_id}/posts
# This will be in a workspace-specific router or handled differently if we want to keep /posts clean

@router.get("/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud.crud_post.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.put("/{post_id}", response_model=schemas.Post)
def update_existing_post(
    post_id: int, 
    post_in: schemas.PostUpdate, 
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user) # For auth
):
    db_post = crud.crud_post.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Add authorization: check if current_user has permission to update this post (e.g., owns workspace)
    
    # If scheduling, trigger Celery task
    if post_in.scheduled_at and post_in.status == models.PostStatus.SCHEDULED:
        # existing_schedule = db_post.scheduled_at
        # if existing_schedule != post_in.scheduled_at or db_post.status != models.PostStatus.SCHEDULED:
            # Potentially cancel old Celery task if schedule changed, then create new one
            # Ensure that scheduled_at is a datetime object
            if post_in.scheduled_at:
                publish_post_task.apply_async(args=[db_post.id], eta=post_in.scheduled_at)
                print(f"Re-scheduling post {db_post.id} for {post_in.scheduled_at}") # Placeholder
            else:
                # If scheduled_at is removed, consider canceling existing task if any
                pass

    updated_post = crud.crud_post.update_post(db=db, post_id=post_id, post_update=post_in)
    return updated_post

@router.delete("/{post_id}", response_model=schemas.Post)
def delete_existing_post(
    post_id: int, 
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user) # For auth
):
    db_post = crud.crud_post.get_post(db, post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Add authorization: check if current_user has permission to delete this post
    # Add logic: only delete if status is 'draft' or 'scheduled'
    if db_post.status in [models.PostStatus.POSTED, models.PostStatus.ERROR]:
        raise HTTPException(status_code=400, detail=f"Cannot delete post with status '{db_post.status.value}'")

    # If it was a scheduled post, cancel the Celery task
    # if db_post.status == models.PostStatus.SCHEDULED and db_post.scheduled_at:
        # Need a way to find and revoke the Celery task by post_id or a unique task_id stored with the post
        # pass
        
    deleted_post = crud.crud_post.delete_post(db=db, post_id=post_id)
    return deleted_post

# The following endpoints are workspace-specific as per the request
# We might create a separate router for /workspaces/{workspace_id}/posts

workspace_router = APIRouter(
    prefix="/workspaces/{workspace_id}/posts",
    tags=["workspace-posts"],
    # dependencies=[Depends(get_current_active_user)], # Uncomment when auth is ready
    responses={404: {"description": "Not found"}},
)

@workspace_router.post("/", response_model=List[schemas.Post], status_code=status.HTTP_201_CREATED)
def create_new_posts_for_workspace(
    workspace_id: int,
    post_request: schemas.PostCreateRequest,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user) # For auth
):
    # Authorization: Check if current_user has access to this workspace_id
    # db_workspace = crud.crud_workspace.get_workspace(db, workspace_id=workspace_id) # Assuming crud_workspace exists
    # if not db_workspace or not current_user_in_workspace(current_user, db_workspace):
    #     raise HTTPException(status_code=403, detail="Not authorized to create posts in this workspace")

    created_posts = []
    for acc_id in post_request.connected_account_ids:
        # Verify connected_account_id belongs to the workspace_id
        # db_connected_account = crud.crud_connected_account.get(db, id=acc_id) # Assuming this exists
        # if not db_connected_account or db_connected_account.workspace_id != workspace_id:
        #     raise HTTPException(status_code=400, detail=f"Connected account {acc_id} not found in workspace {workspace_id}")

        post_data = schemas.PostCreateData(
            workspace_id=workspace_id, # Use path parameter
            connected_account_id=acc_id,
            content_text=post_request.content_text,
            media_url=post_request.media_url,
            scheduled_at=post_request.scheduled_at,
            status=models.PostStatus.SCHEDULED if post_request.scheduled_at else models.PostStatus.DRAFT,
            author_id=None # current_user.id if current_user else None # Set author from logged-in user
        )
        db_post = crud.crud_post.create_post(db=db, post=post_data, author_id=post_data.author_id)
        
        # If scheduled, trigger Celery task
        if db_post.status == models.PostStatus.SCHEDULED and db_post.scheduled_at:
            publish_post_task.apply_async(args=[db_post.id], eta=db_post.scheduled_at)
            print(f"Scheduling post {db_post.id} for {db_post.scheduled_at}") # Placeholder
        created_posts.append(db_post)
    return created_posts

@workspace_router.get("/", response_model=List[schemas.Post])
def read_posts_for_workspace(
    workspace_id: int, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_active_user) # For auth
):
    # Authorization: Check if current_user has access to this workspace_id
    posts = crud.crud_post.get_posts_by_workspace(
        db, workspace_id=workspace_id, skip=skip, limit=limit, start_date=start_date, end_date=end_date
    )
    return posts