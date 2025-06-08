from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas

def get_social_platform(db: Session, platform_id: int) -> Optional[models.SocialPlatform]:
    return db.query(models.SocialPlatform).filter(models.SocialPlatform.id == platform_id).first()

def get_social_platform_by_name(db: Session, name: str) -> Optional[models.SocialPlatform]:
    return db.query(models.SocialPlatform).filter(models.SocialPlatform.name == name).first()

def get_social_platforms(db: Session, skip: int = 0, limit: int = 100) -> List[models.SocialPlatform]:
    return db.query(models.SocialPlatform).offset(skip).limit(limit).all()

def create_social_platform(db: Session, platform_in: schemas.SocialPlatformCreate) -> models.SocialPlatform:
    # Check if platform with the same name already exists to prevent duplicates, if name should be unique
    existing_platform = get_social_platform_by_name(db, name=platform_in.name)
    if existing_platform:
        # Depending on requirements, could raise an error or return the existing one
        raise ValueError(f"Social platform with name '{platform_in.name}' already exists.")

    db_platform = models.SocialPlatform(
        name=platform_in.name,
        api_base_url=str(platform_in.api_base_url) if platform_in.api_base_url else None,
        # platform_type is in schema but not in model SocialPlatform in provided files.
        # If it were in the model: platform_type=platform_in.platform_type
    )
    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)
    return db_platform

# Optional: Update and Delete for social platforms, typically admin-only
def update_social_platform(db: Session, platform_id: int, platform_in: schemas.SocialPlatformUpdate) -> Optional[models.SocialPlatform]:
    db_platform = get_social_platform(db, platform_id)
    if not db_platform:
        return None

    update_data = platform_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "api_base_url" and value is not None:
            setattr(db_platform, field, str(value))
        else:
            setattr(db_platform, field, value)

    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)
    return db_platform

def delete_social_platform(db: Session, platform_id: int) -> Optional[models.SocialPlatform]:
    db_platform = get_social_platform(db, platform_id)
    if db_platform:
        # Consider if related ConnectedAccounts should be handled (e.g., set platform_id to null, or prevent delete if linked)
        db.delete(db_platform)
        db.commit()
    return db_platform
