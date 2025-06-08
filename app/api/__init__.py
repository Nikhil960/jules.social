from fastapi import APIRouter

from .posts import router as posts_router
from .posts import workspace_router as posts_workspace_router # This is for /workspaces/{id}/posts
from .ai_assistant import router as ai_assistant_router
from .auth import router as auth_router
from .users import router as users_router
from .workspaces import router as workspaces_router # This is for /workspaces
from .connected_accounts import router as connected_accounts_router
from .social_platforms import router as social_platforms_router

# Main API router
api_router = APIRouter()

# Include all routers. The prefix for these are defined within each router file.
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspaces_router) # Handles /workspaces
api_router.include_router(posts_router) # Handles /posts
api_router.include_router(posts_workspace_router) # Handles /workspaces/{workspace_id}/posts
api_router.include_router(connected_accounts_router) # Handles /workspaces/{workspace_id}/connected_accounts
api_router.include_router(social_platforms_router)
api_router.include_router(ai_assistant_router, prefix="/ai", tags=["AI Assistant"]) # /ai prefix added here