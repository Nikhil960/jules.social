# SociaLoom/backend/models.py
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

# =================== Token Models ===================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# =================== User Models ===================
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_client: bool = False

class UserCreate(UserBase):
    password: str

class UserInDBBase(UserBase):
    id: int

    class Config:
        orm_mode = True # Changed from from_attributes = True for Pydantic v1
        # For Pydantic v2, use: model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str


# =================== Workspace Models ===================
class WorkspaceBase(BaseModel):
    name: str

class WorkspaceCreate(WorkspaceBase):
    pass

class Workspace(WorkspaceBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class WorkspaceMember(BaseModel):
    user_id: int
    workspace_id: int
    role: str # e.g., "manager", "client"

    class Config:
        orm_mode = True


# =================== Connected Account Models ===================
class ConnectedAccountBase(BaseModel):
    platform_name: str # e.g., "Instagram", "Facebook", "Twitter"
    username: str

class ConnectedAccountCreate(ConnectedAccountBase):
    # Potentially platform-specific auth details, but we're mocking, so keep simple
    access_token: str # Mocked access token

class ConnectedAccount(ConnectedAccountBase):
    id: int
    workspace_id: int

    class Config:
        orm_mode = True


# =================== Post Models ===================
class PostBase(BaseModel):
    content: str
    media_urls: Optional[List[HttpUrl]] = []
    scheduled_at: Optional[datetime] = None
    connected_account_ids: List[int] # Accounts to post to

class PostCreate(PostBase):
    pass # created_at, updated_at will be set by server

class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[HttpUrl]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    connected_account_ids: Optional[List[int]] = None

class Post(PostBase):
    id: int
    workspace_id: int
    user_id: int # Author ID
    status: str # e.g., draft, pending_approval, needs_revision, approved, scheduled, posted, failed
    created_at: datetime
    updated_at: datetime
    # approval_requests: Optional[List[Dict[str, Any]]] = [] # Simplified for now
    # client_feedback: Optional[List[Dict[str, Any]]] = [] # Simplified for now

    class Config:
        orm_mode = True

# =================== AI Assistant Models ===================
class AIGenerateCaptionRequest(BaseModel):
    prompt: Optional[str] = None
    tone: Optional[str] = "neutral"
    platform: Optional[str] = "general"

class AIGenerateCaptionResponse(BaseModel):
    captions: List[str]

class AIGenerateHashtagsRequest(BaseModel):
    keywords: List[str]
    platform: Optional[str] = "general"

class AIGenerateHashtagsResponse(BaseModel):
    hashtags: List[str]

class AIIdea(BaseModel):
    title: str
    brief: str

class AIGenerateIdeasRequest(BaseModel):
    topic: str
    industry: Optional[str] = None

class AIGenerateIdeasResponse(BaseModel):
    ideas: List[AIIdea]

# =================== Approval Workflow Models ===================
class PostSubmitForApprovalRequest(BaseModel):
    message: Optional[str] = None # Optional message to client

class PostApproveRequest(BaseModel):
    message: Optional[str] = None # Optional message back to manager

class PostRequestChangesRequest(BaseModel):
    comments: str # Comments detailing required changes
