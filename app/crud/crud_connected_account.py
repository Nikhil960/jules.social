from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.crud.crud_workspace import is_user_member_of_workspace # For authorization check

def get_connected_account(db: Session, account_id: int) -> Optional[models.ConnectedAccount]:
    return db.query(models.ConnectedAccount).filter(models.ConnectedAccount.id == account_id).first()

def get_connected_accounts_for_workspace(
    db: Session, workspace_id: int, skip: int = 0, limit: int = 100
) -> List[models.ConnectedAccount]:
    return (
        db.query(models.ConnectedAccount)
        .filter(models.ConnectedAccount.workspace_id == workspace_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_connected_account(
    db: Session, account_in: schemas.ConnectedAccountCreate, user_id: int
) -> models.ConnectedAccount:
    # Authorize: Check if the user is a member of the target workspace
    if not is_user_member_of_workspace(db, user_id=user_id, workspace_id=account_in.workspace_id):
        # In a real scenario, we'd raise HTTPException here, but CRUD layers typically don't handle HTTP directly.
        # The API layer should handle this before calling the CRUD function.
        # For now, let's raise a ValueError or return None, or expect the API layer to ensure this.
        raise ValueError("User is not a member of the target workspace.")

    # Create the object, letting the model's setters handle encryption
    db_account = models.ConnectedAccount(
        user_id=user_id, # It might be better to get user_id from current_user in API layer
        workspace_id=account_in.workspace_id,
        platform_id=account_in.platform_id,
        platform_account_id=account_in.account_id_on_platform, # Ensure schema field name matches model
        platform_account_name=account_in.account_name, # Ensure schema field name matches model
        access_token=account_in.access_token, # Setter will encrypt
        refresh_token=account_in.refresh_token, # Setter will encrypt
        token_expires_at=account_in.token_expires_at,
        # scopes field is not in ConnectedAccountCreate schema in this version
        is_active=True # Default, or from schema if added
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def update_connected_account(
    db: Session, account_id: int, account_in: schemas.ConnectedAccountUpdate
) -> Optional[models.ConnectedAccount]:
    db_account = get_connected_account(db, account_id=account_id)
    if not db_account:
        return None

    update_data = account_in.model_dump(exclude_unset=True)

    # Handle token encryption via model setters
    if "access_token" in update_data and update_data["access_token"] is not None:
        db_account.access_token = update_data.pop("access_token")

    if "refresh_token" in update_data: # Can be None to clear it
        db_account.refresh_token = update_data.pop("refresh_token")

    for field, value in update_data.items():
        setattr(db_account, field, value)

    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def delete_connected_account(db: Session, account_id: int) -> Optional[models.ConnectedAccount]:
    db_account = get_connected_account(db, account_id=account_id)
    if db_account:
        # Consider if there are related posts that need to be handled or if a cascade is set up
        db.delete(db_account)
        db.commit()
    return db_account
