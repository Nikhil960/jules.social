from fastapi import APIRouter

from .posts import router as posts_router
from .posts import workspace_router as posts_workspace_router
from .ai_assistant import router as ai_assistant_router

# You can create a main API router here to include all other routers
api_router = APIRouter()
api_router.include_router(posts_router, tags=["Posts - General"])
api_router.include_router(posts_workspace_router, tags=["Posts - Workspace Specific"])
api_router.include_router(ai_assistant_router, prefix="/ai", tags=["AI Assistant"])

# Example for future routers:
# from .users import router as users_router
# api_router.include_router(users_router, prefix="/users", tags=["Users"])