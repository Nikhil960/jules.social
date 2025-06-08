from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.dependencies import get_db, get_current_active_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_users_me(
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user.
    """
    # user_id for crud.crud_user.update_user should be current_user.id
    updated_user = crud.crud_user.update_user(db, user_id=current_user.id, user_in=user_in)
    if not updated_user:
        # This case should ideally not happen if current_user exists
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found for update")
    return updated_user

# Admin endpoints (example, can be expanded and secured later)
# To secure these, you might add another dependency like: Depends(get_current_active_superuser)

@router.get("/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    # current_user: models.User = Depends(get_current_active_superuser), # Example for superuser
    db: Session = Depends(get_db)
):
    """
    Retrieve users. (Example of an admin-restricted endpoint)
    For now, accessible by any active user. Secure properly in a real app.
    """
    users = crud.crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
async def read_user_by_id(
    user_id: int,
    # current_user: models.User = Depends(get_current_active_superuser), # Example for superuser
    db: Session = Depends(get_db)
):
    """
    Get a specific user by ID. (Example of an admin-restricted endpoint)
    For now, accessible by any active user. Secure properly in a real app.
    """
    db_user = crud.crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return db_user

@router.delete("/{user_id}", response_model=schemas.User)
async def delete_user_by_id(
    user_id: int,
    current_user: models.User = Depends(get_current_active_user), # For checking if user is deleting themselves or is superuser
    db: Session = Depends(get_db)
):
    """
    Delete a user. (Example of an admin-restricted endpoint or self-delete)
    For now, allows deleting any user if you know their ID. Secure properly.
    A user should not be able to delete themselves via this generic endpoint usually.
    Superusers might.
    """
    if user_id == current_user.id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Users cannot delete themselves through this endpoint.")

    # Add superuser check here if this is admin only
    # if not current_user.is_superuser:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    deleted_user = crud.crud_user.delete_user(db, user_id=user_id)
    if not deleted_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return deleted_user
