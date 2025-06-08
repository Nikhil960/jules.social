from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.dependencies import get_db, get_current_active_user
# For admin-only POST, you might need a get_current_active_superuser dependency

router = APIRouter(
    prefix="/social_platforms",
    tags=["social_platforms"],
    dependencies=[Depends(get_current_active_user)] # Basic auth for all platform endpoints
)

@router.get("/", response_model=List[schemas.SocialPlatform])
async def read_social_platforms_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get a list of all available social platforms.
    """
    platforms = crud.crud_social_platform.get_social_platforms(db, skip=skip, limit=limit)
    return platforms

@router.get("/{platform_id}", response_model=schemas.SocialPlatform)
async def read_social_platform_by_id(
    platform_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific social platform by its ID.
    """
    db_platform = crud.crud_social_platform.get_social_platform(db, platform_id=platform_id)
    if db_platform is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Social platform not found")
    return db_platform

# Example of an admin-only endpoint for creating a social platform.
# In a real app, this would be protected by a superuser check.
@router.post("/", response_model=schemas.SocialPlatform, status_code=status.HTTP_201_CREATED)
async def create_new_social_platform(
    platform_in: schemas.SocialPlatformCreate,
    # current_user: models.User = Depends(get_current_active_superuser), # Uncomment for admin-only
    db: Session = Depends(get_db)
):
    """
    Create a new social platform.
    (This endpoint would typically be restricted to admin users).
    """
    try:
        db_platform = crud.crud_social_platform.create_social_platform(db, platform_in=platform_in)
    except ValueError as e: # Catch duplicate name error from CRUD
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return db_platform
