from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Enum as SAEnum, LargeBinary, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from .core.security import encrypt_data, decrypt_data # For encrypting tokens
import enum

# Association table for many-to-many relationship between User and Workspace
user_workspace_association = Table(
    'user_workspace', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('workspace_id', Integer, ForeignKey('workspaces.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workspaces = relationship("Workspace", secondary=user_workspace_association, back_populates="users")
    connected_accounts = relationship("ConnectedAccount", back_populates="user")
    posts_created = relationship("Post", back_populates="author") # If we want to track who created the post

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    users = relationship("User", secondary=user_workspace_association, back_populates="workspaces")
    connected_accounts = relationship("ConnectedAccount", back_populates="workspace")
    posts = relationship("Post", back_populates="workspace")

class SocialPlatform(Base):
    __tablename__ = "social_platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g., 'Facebook', 'Instagram', 'Twitter'
    api_base_url = Column(String, nullable=True) # Optional: for platform-specific API calls
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    connected_accounts = relationship("ConnectedAccount", back_populates="platform")

class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=False)
    platform_id = Column(Integer, ForeignKey('social_platforms.id'), nullable=False)
    platform_account_id = Column(String, index=True, nullable=False) # e.g., Instagram user ID, Facebook Page ID
    platform_account_name = Column(String, nullable=True) # e.g., Instagram username
    
    _access_token = Column(LargeBinary, nullable=False) # Encrypted
    _refresh_token = Column(LargeBinary, nullable=True) # Encrypted, if applicable
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(String, nullable=True) # Comma-separated list of granted permissions
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="connected_accounts")
    workspace = relationship("Workspace", back_populates="connected_accounts")
    platform = relationship("SocialPlatform", back_populates="connected_accounts")
    posts = relationship("Post", back_populates="connected_account")

    @property
    def access_token(self) -> str:
        return decrypt_data(self._access_token)

    @access_token.setter
    def access_token(self, value: str):
        self._access_token = encrypt_data(value)

    @property
    def refresh_token(self) -> str | None:
        if self._refresh_token:
            return decrypt_data(self._refresh_token)
        return None

    @refresh_token.setter
    def refresh_token(self, value: str | None):
        if value:
            self._refresh_token = encrypt_data(value)
        else:
            self._refresh_token = None

class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    POSTED = "posted"
    ERROR = "error"
    ARCHIVED = "archived"

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'), nullable=False)
    connected_account_id = Column(Integer, ForeignKey('connected_accounts.id'), nullable=False)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=True) # User who created/scheduled the post
    
    content_text = Column(String, nullable=True)
    # content_media_urls = Column(JSON, nullable=True) # For multiple images/videos, store as list of URLs
    # For simplicity, let's start with a single media URL
    media_url = Column(String, nullable=True)
    status = Column(SAEnum(PostStatus), default=PostStatus.DRAFT, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(String, nullable=True)
    platform_post_id = Column(String, nullable=True) # ID of the post on the social platform
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workspace = relationship("Workspace", back_populates="posts")
    connected_account = relationship("ConnectedAccount", back_populates="posts")
    author = relationship("User", back_populates="posts_created")

# To create all tables in the database (run this once, e.g., in a migration script or initial setup)
# from .database import engine
# Base.metadata.create_all(bind=engine)