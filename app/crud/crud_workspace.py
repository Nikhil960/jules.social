from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas

def get_workspace(db: Session, workspace_id: int) -> Optional[models.Workspace]:
    return db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()

def is_user_member_of_workspace(db: Session, user_id: int, workspace_id: int) -> bool:
    workspace = get_workspace(db, workspace_id=workspace_id)
    if not workspace:
        return False
    for user in workspace.users: # Assuming workspace.users is the relationship attribute
        if user.id == user_id:
            return True
    return False

def create_workspace_for_user(db: Session, workspace_in: schemas.WorkspaceCreate, user_id: int) -> models.Workspace:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        # This case should ideally be prevented by auth, but good to have a check
        raise ValueError("User not found")

    db_workspace = models.Workspace(**workspace_in.model_dump(), owner_id=user_id)
    db_workspace.users.append(user) # Associate the user with the workspace
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

def get_workspaces_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Workspace]:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return [] # Or raise an exception, depending on desired behavior
    # Assuming user.workspaces is the relationship attribute defined in models.User
    # This will typically trigger a lazy load or a joined load if configured.
    # For pagination on a many-to-many, a more complex query might be needed
    # if user.workspaces is not already a paginated list.
    # However, SQLAlchemy's relationship collections are lists, so slicing works directly.

    # A more explicit query for pagination on the relationship:
    return (
        db.query(models.Workspace)
        .join(models.user_workspace_association)
        .filter(models.user_workspace_association.c.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_workspace(db: Session, workspace_id: int, workspace_in: schemas.WorkspaceUpdate) -> Optional[models.Workspace]:
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if not db_workspace:
        return None

    update_data = workspace_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_workspace, field, value)

    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

def delete_workspace(db: Session, workspace_id: int) -> Optional[models.Workspace]:
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if db_workspace:
        # Consider implications: what happens to posts, connected_accounts in this workspace?
        # SQLAlchemy can be configured for cascade deletes on relationships,
        # or you might need to handle it manually here if specific logic is needed.
        # For now, a simple delete:
        db.delete(db_workspace)
        db.commit()
    return db_workspace
