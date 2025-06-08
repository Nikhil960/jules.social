from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, crud
from app.dependencies import get_db, get_current_active_user

router = APIRouter(
    prefix="/workspaces",
    tags=["workspaces"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/", response_model=schemas.Workspace, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: schemas.WorkspaceCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workspace for the current user.
    The user will be automatically added as a member and owner.
    """
    db_workspace = crud.crud_workspace.create_workspace_for_user(
        db=db, workspace_in=workspace_in, user_id=current_user.id
    )
    return db_workspace

@router.get("/", response_model=List[schemas.Workspace])
async def read_workspaces_for_current_user(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all workspaces the current user is a member of.
    """
    workspaces = crud.crud_workspace.get_workspaces_for_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return workspaces

@router.get("/{workspace_id}", response_model=schemas.Workspace)
async def read_workspace_by_id(
    workspace_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific workspace by ID.
    User must be a member of the workspace.
    """
    if not crud.crud_workspace.is_user_member_of_workspace(db, user_id=current_user.id, workspace_id=workspace_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this workspace")

    db_workspace = crud.crud_workspace.get_workspace(db, workspace_id=workspace_id)
    if db_workspace is None:
        # This case might be redundant if is_user_member_of_workspace implies existence,
        # but good for robustness if get_workspace is called directly.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return db_workspace

@router.put("/{workspace_id}", response_model=schemas.Workspace)
async def update_workspace_by_id(
    workspace_id: int,
    workspace_in: schemas.WorkspaceUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a workspace.
    User must be a member of the workspace (further role-based auth might be needed for specific updates, e.g. owner).
    """
    if not crud.crud_workspace.is_user_member_of_workspace(db, user_id=current_user.id, workspace_id=workspace_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this workspace")

    # TODO: Add more granular permission check, e.g., only workspace owner can update.
    # For now, any member can update.

    updated_workspace = crud.crud_workspace.update_workspace(db, workspace_id=workspace_id, workspace_in=workspace_in)
    if not updated_workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found for update")
    return updated_workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace_by_id(
    workspace_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a workspace.
    User must be a member (typically owner) of the workspace.
    """
    # TODO: Add more granular permission check, e.g., only workspace owner can delete.
    # For now, any member can attempt, but is_user_member_of_workspace will check membership.
    # The crud operation itself doesn't re-verify ownership before deleting.

    db_workspace_to_check = crud.crud_workspace.get_workspace(db, workspace_id=workspace_id)
    if not db_workspace_to_check:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")

    if not crud.crud_workspace.is_user_member_of_workspace(db, user_id=current_user.id, workspace_id=workspace_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this workspace")

    # Add specific check for ownership if required:
    # if db_workspace_to_check.owner_id != current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the workspace owner can delete the workspace")

    deleted_workspace = crud.crud_workspace.delete_workspace(db, workspace_id=workspace_id)
    if not deleted_workspace:
        # This case should have been caught by the check above, but for safety:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found for deletion")

    return None # For 204 No Content
