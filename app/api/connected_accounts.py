from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, crud
from app.dependencies import get_db, get_current_active_user

# The prefix will be /workspaces/{workspace_id}/connected_accounts
# This means workspace_id will be a path parameter for all routes here.
router = APIRouter(
    prefix="/workspaces/{workspace_id}/connected_accounts",
    tags=["connected_accounts"],
    dependencies=[Depends(get_current_active_user)]
)

# Helper function to check workspace membership for this router
async def verify_workspace_membership(
    workspace_id: int = Path(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not crud.crud_workspace.is_user_member_of_workspace(db, user_id=current_user.id, workspace_id=workspace_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage connected accounts in this workspace."
        )
    return workspace_id # Return workspace_id for convenience if needed in endpoint

@router.post("/", response_model=schemas.ConnectedAccount, status_code=status.HTTP_201_CREATED)
async def create_new_connected_account(
    account_in: schemas.ConnectedAccountCreate,
    workspace_id: int = Depends(verify_workspace_membership), # workspace_id from path, verified
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new connected account within a specific workspace.
    User must be a member of the workspace.
    """
    if account_in.workspace_id != workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The workspace_id in the request body ({account_in.workspace_id}) "
                   f"does not match the workspace_id in the URL path ({workspace_id})."
        )

    # crud_connected_account.create_connected_account already checks membership via account_in.workspace_id
    # but verify_workspace_membership does it for the path workspace_id.
    # The user_id for creating the account is current_user.id.
    db_account = crud.crud_connected_account.create_connected_account(
        db=db, account_in=account_in, user_id=current_user.id
    )
    if not db_account: # Should be caught by ValueError in CRUD if user not member, but good practice
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create connected account.")
    return db_account

@router.get("/", response_model=List[schemas.ConnectedAccount])
async def read_connected_accounts_in_workspace(
    workspace_id: int = Depends(verify_workspace_membership), # Path param
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all connected accounts for a specific workspace.
    User must be a member of the workspace.
    """
    accounts = crud.crud_connected_account.get_connected_accounts_for_workspace(
        db=db, workspace_id=workspace_id, skip=skip, limit=limit
    )
    return accounts

@router.get("/{account_id}", response_model=schemas.ConnectedAccount)
async def read_connected_account_by_id(
    account_id: int,
    workspace_id: int = Depends(verify_workspace_membership), # Path param
    db: Session = Depends(get_db)
):
    """
    Get a specific connected account by ID from a workspace.
    User must be a member of the workspace.
    """
    db_account = crud.crud_connected_account.get_connected_account(db, account_id=account_id)
    if db_account is None or db_account.workspace_id != workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected account not found in this workspace.")
    return db_account

@router.put("/{account_id}", response_model=schemas.ConnectedAccount)
async def update_existing_connected_account(
    account_id: int,
    account_in: schemas.ConnectedAccountUpdate,
    workspace_id: int = Depends(verify_workspace_membership), # Path param
    db: Session = Depends(get_db)
):
    """
    Update a connected account.
    User must be a member of the workspace.
    """
    db_account_check = crud.crud_connected_account.get_connected_account(db, account_id=account_id)
    if db_account_check is None or db_account_check.workspace_id != workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected account not found for update in this workspace.")

    updated_account = crud.crud_connected_account.update_connected_account(
        db=db, account_id=account_id, account_in=account_in
    )
    if not updated_account: # Should be caught by the check above
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected account not found for update.")
    return updated_account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_connected_account(
    account_id: int,
    workspace_id: int = Depends(verify_workspace_membership), # Path param
    db: Session = Depends(get_db)
):
    """
    Delete a connected account.
    User must be a member of the workspace.
    """
    db_account_check = crud.crud_connected_account.get_connected_account(db, account_id=account_id)
    if db_account_check is None or db_account_check.workspace_id != workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected account not found for deletion in this workspace.")

    deleted_account = crud.crud_connected_account.delete_connected_account(db, account_id=account_id)
    if not deleted_account: # Should be caught by the check above
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected account not found for deletion.")

    return None # For 204 No Content
