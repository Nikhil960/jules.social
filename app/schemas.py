from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional, Union
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

# Workspace Schemas
class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(WorkspaceBase):
    name: Optional[str] = None

class WorkspaceInDBBase(WorkspaceBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Workspace(WorkspaceInDBBase):
    pass

# SocialPlatform Schemas
class SocialPlatformBase(BaseModel):
    name: str
    api_base_url: Optional[HttpUrl] = None
    platform_type: Optional[str] = None # e.g., 'facebook', 'twitter', 'instagram'

class SocialPlatformCreate(SocialPlatformBase):
    pass

class SocialPlatformUpdate(SocialPlatformBase):
    name: Optional[str] = None

class SocialPlatformInDBBase(SocialPlatformBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SocialPlatform(SocialPlatformInDBBase):
    pass

# ConnectedAccount Schemas
class ConnectedAccountBase(BaseModel):
    account_name: str
    account_id_on_platform: Optional[str] = None # e.g., Facebook Page ID, Twitter User ID
    # access_token: str # Sensitive, will be handled carefully
    # refresh_token: Optional[str] = None # Sensitive
    # token_expires_at: Optional[datetime] = None
    is_active: bool = True

class ConnectedAccountCreate(ConnectedAccountBase):
    workspace_id: int
    platform_id: int
    access_token: str # Will be encrypted before saving
    refresh_token: Optional[str] = None # Will be encrypted
    token_expires_at: Optional[datetime] = None

class ConnectedAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    is_active: Optional[bool] = None
    access_token: Optional[str] = None # For token refresh, will be encrypted
    refresh_token: Optional[str] = None # Will be encrypted
    token_expires_at: Optional[datetime] = None

class ConnectedAccountInDBBase(ConnectedAccountBase):
    id: int
    workspace_id: int
    platform_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    platform: Optional[SocialPlatform] = None # For eager loading

    class Config:
        from_attributes = True

class ConnectedAccount(ConnectedAccountInDBBase):
    pass

class ConnectedAccountWithSensitiveData(ConnectedAccount):
    access_token_encrypted: str
    refresh_token_encrypted: Optional[str] = None

# Post Schemas
class PostBase(BaseModel):
    content_text: Optional[str] = None
    media_url: Optional[HttpUrl] = None
    status: str = "draft"  # e.g., draft, scheduled, posted, error
    scheduled_at: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    error_message: Optional[str] = None

class PostCreateData(PostBase): # Renamed from PostCreate for clarity
    workspace_id: int
    # connected_account_id will be handled by PostCreateRequest for multiple accounts

class PostCreateRequest(BaseModel): # New schema for API request
    post_data: PostCreateData
    connected_account_ids: List[int]

class PostUpdate(BaseModel):
    content_text: Optional[str] = None
    media_url: Optional[HttpUrl] = None
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    error_message: Optional[str] = None
    # connected_account_id: Optional[int] = None # If allowing to change account, though less common for updates

class PostInDBBase(PostBase):
    id: int
    workspace_id: int
    connected_account_id: int # Each post is linked to one specific account instance
    created_at: datetime
    updated_at: Optional[datetime] = None
    connected_account: Optional[ConnectedAccount] = None # For eager loading

    class Config:
        from_attributes = True

class Post(PostInDBBase):
    pass

# Token Schemas (for authentication - placeholder)
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# AI Assistant Schemas
class AICaptionRequest(BaseModel):
    prompt: str
    tone: Optional[str] = "neutral" # e.g., witty, professional, casual, informative

class AIHashtagRequest(BaseModel):
    post_content: str

class AIIdeaRequest(BaseModel):
    topic: str

class AIGeneratedContent(BaseModel):
    # Can be a list of strings (captions, hashtags, ideas) or a more complex structure
    generated_text: Union[List[str], List[dict], str] 

class AIGeneratedCaptionsResponse(BaseModel):
    captions: List[str]

class AIGeneratedHashtagsResponse(BaseModel):
    hashtags: List[str]

class PostIdea(BaseModel):
    title: str
    brief: str

class AIGeneratedIdeasResponse(BaseModel):
    ideas: List[PostIdea]