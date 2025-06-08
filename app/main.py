from fastapi import FastAPI
from .database import engine, Base # Import Base and engine
from .core.config import settings # Import settings for API prefix
# Import your models here to ensure they are registered with Base.metadata
from . import models # This will make SQLAlchemy aware of your models

# Create database tables (For development only. Use Alembic for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Media Manager API",
    description="API for managing social media posts and accounts.",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Social Media Manager API!"}

from .api import api_router # Import the consolidated API router

app.include_router(api_router, prefix=settings.API_V1_STR)

# Expose Celery app for easier worker startup if desired, though worker can point to core.celery_app directly
# from .core.celery_app import celery_app
# print(f"Celery App: {celery_app.main}")