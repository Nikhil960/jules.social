# SociaLoom/backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Dict, Any
from datetime import datetime, timedelta
import time # For simulate_publishing

# Import models and in-memory DB
from . import models
from .in_memory_db import db, get_next_id
from typing import Optional # Added Optional

# --- Constants (Mock JWT settings) ---
# In a real app, use environment variables for these
SECRET_KEY = "your-secret-key" # Not really used for signing, but good practice
ALGORITHM = "HS256" # Not really used
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- FastAPI App Initialization ---
app = FastAPI(title="SociaLoom API", version="0.1.0")

# --- Mock Authentication ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mock password hashing (in a real app, use passlib or similar)
def verify_password(plain_password, hashed_password):
    # For this prototype, we assume passwords are not actually hashed in db for simplicity
    # or that "fake_password_hash" is the "hashed" version of any password.
    # The prompt states "fake_password_hash", so we'll just check against that.
    # For a slightly more realistic mock, one could store plain passwords in the mock DB
    # or have a fixed password like "password" for all users.
    # Given "fake_password_hash", we'll assume any password attempt against it is "valid" for mock users.
    # Let's refine this: we'll check if the db stores "fake_password_hash" for the user.
    # And for the login itself, we'll just check if the user exists and use a common password e.g. "password"
    return True # Simplified for prototype: any password attempt is valid if user exists and has "fake_password_hash"

def get_user_by_email(email: str) -> models.UserInDB | None:
    for user_dict in db["users"]:
        if user_dict["email"] == email:
            return models.UserInDB(**user_dict)
    return None

# This is a simplified "create_access_token" for the prototype.
# It doesn't create a real JWT, just a uniquely identifiable token.
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    # In a real app, you would set an expiry time:
    # if expires_delta:
    #     expire = datetime.utcnow() + expires_delta
    # else:
    #     expire = datetime.utcnow() + timedelta(minutes=15)
    # to_encode.update({"exp": expire})
    # encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # return encoded_jwt

    # For prototype: simple fake token
    user_id = to_encode.get("user_id")
    return f"fake-token-for-user-{user_id}"


@app.post("/token", response_model=models.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form_data.username)
    # Using a generic password "password" for all mock users for simplicity
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": user.id, "sub": user.email} # "sub" is standard JWT claim for subject (often username/email)
        # expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> models.User:
    if not token.startswith("fake-token-for-user-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials (token format)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id_str = token.split("fake-token-for-user-")[1]
        user_id = int(user_id_str)
    except (IndexError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials (token parsing)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = next((u for u in db["users"] if u["id"] == user_id), None)
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return models.User(**user_data)

async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    # In a real app, you might check if user.disabled or similar here
    # For this prototype, if they have a token, they are "active"
    return current_user

# Example protected endpoint (will be removed later, just for testing auth)
@app.get("/users/me/", response_model=models.User)
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

# --- Placeholder for other routers/endpoints to be added later ---
# e.g., app.include_router(workspaces.router, prefix="/api/v1")
# e.g., app.include_router(posts.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to SociaLoom API"}

# Note: Specific API endpoints for workspaces, posts, etc., will be added in subsequent steps.
# This file sets up the FastAPI app instance and the core authentication logic.


# --- Workspace Management Endpoints ---

@app.post("/api/v1/workspaces", response_model=models.Workspace, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: models.WorkspaceCreate,
    current_user: models.User = Depends(get_current_active_user)
):
    new_workspace_id = get_next_id("workspaces")
    new_workspace = models.Workspace(
        id=new_workspace_id,
        name=workspace_data.name,
        owner_id=current_user.id
    )
    db["workspaces"].append(new_workspace.dict()) # Use .model_dump() for Pydantic v2

    # Add creator as a manager member of the workspace
    new_member_entry = {
        "user_id": current_user.id,
        "workspace_id": new_workspace_id,
        "role": "manager"
    }
    db["workspace_members"].append(new_member_entry)

    return new_workspace

@app.get("/api/v1/workspaces", response_model=List[models.Workspace])
async def list_workspaces(
    current_user: models.User = Depends(get_current_active_user)
):
    user_workspace_ids = [
        member_entry["workspace_id"]
        for member_entry in db["workspace_members"]
        if member_entry["user_id"] == current_user.id
    ]

    user_workspaces = [
        models.Workspace(**ws) for ws in db["workspaces"] if ws["id"] in user_workspace_ids
    ]
    return user_workspaces

def get_workspace_if_member(workspace_id: int, user_id: int) -> Dict[str, Any] | None:
    # Check if user is a member of the workspace
    is_member = any(
        entry["user_id"] == user_id and entry["workspace_id"] == workspace_id
        for entry in db["workspace_members"]
    )
    if not is_member:
        return None

    workspace_data = next((ws for ws in db["workspaces"] if ws["id"] == workspace_id), None)
    return workspace_data

@app.get("/api/v1/workspaces/{workspace_id}", response_model=models.Workspace)
async def get_workspace_details(
    workspace_id: int,
    current_user: models.User = Depends(get_current_active_user)
):
    workspace_data = get_workspace_if_member(workspace_id, current_user.id)

    if not workspace_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace with ID {workspace_id} not found or user is not a member."
        )
    return models.Workspace(**workspace_data)

# (Optional: Add PUT and DELETE for workspaces later if time permits, as per plan)
# For now, focusing on GET and POST for core functionality.


# --- Background Task for Simulating Publishing ---
def simulate_publishing(post_id: int, db_ref: dict):
    print(f"Background task started: Simulating publishing for post ID {post_id}")
    time.sleep(10) # Simulate network delay or publishing work

    post_found = False
    for post_obj in db_ref["posts"]:
        if post_obj["id"] == post_id:
            # Only change to 'posted' if it's in a state that should be published
            # e.g. 'scheduled' or 'approved' (if direct publish from approved is allowed)
            if post_obj["status"] in ["scheduled", "approved"]:
                 post_obj["status"] = "posted"
                 post_obj["updated_at"] = datetime.utcnow()
                 print(f"Background task: Post ID {post_id} status changed to 'posted'")
                 post_found = True
                 break
            else:
                print(f"Background task: Post ID {post_id} was in status '{post_obj['status']}', not changing to 'posted'.")
                post_found = True # Found but not changed
                break
    if not post_found:
        print(f"Background task: Post ID {post_id} not found in DB for publishing.")


# --- Post Management Endpoints ---

@app.post("/api/v1/workspaces/{workspace_id}/posts", response_model=models.Post, status_code=status.HTTP_201_CREATED)
async def create_post(
    workspace_id: int,
    post_data: models.PostCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_active_user)
):
    workspace = get_workspace_if_member(workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this workspace or workspace does not exist."
        )

    new_post_id = get_next_id("posts")
    now = datetime.utcnow()

    # Default status is 'draft' unless specified otherwise and valid
    status = "draft"
    if post_data.scheduled_at and post_data.scheduled_at > now:
        # If a future schedule date is set, it could imply 'scheduled' status,
        # but let's stick to explicit status changes via approval workflow or direct edits for now.
        # For this prototype, creating a post directly as 'scheduled' might be too complex
        # without an explicit status field in PostCreate. Let's assume posts are 'draft' initially.
        pass


    new_post_dict = {
        "id": new_post_id,
        "workspace_id": workspace_id,
        "user_id": current_user.id, # Author
        "content": post_data.content,
        "media_urls": [str(url) for url in post_data.media_urls] if post_data.media_urls else [],
        "scheduled_at": post_data.scheduled_at,
        "connected_account_ids": post_data.connected_account_ids,
        "status": status, # Initial status
        "created_at": now,
        "updated_at": now,
    }
    db["posts"].append(new_post_dict)

    # Example: If a post is created with status 'scheduled' (e.g. if PostCreate had a status field)
    # and scheduled_at is valid, then add background task.
    # For now, simulate_publishing will be triggered by approval/scheduling flows later.
    # if new_post_dict["status"] == "scheduled" and new_post_dict["scheduled_at"] and new_post_dict["scheduled_at"] <= now:
    # background_tasks.add_task(simulate_publishing, new_post_id, db)


    return models.Post(**new_post_dict)


@app.get("/api/v1/workspaces/{workspace_id}/posts", response_model=List[models.Post])
async def list_posts_for_workspace(
    workspace_id: int,
    status_filter: Optional[str] = None, # e.g. ?status_filter=draft
    scheduled_after: Optional[datetime] = None, # e.g. ?scheduled_after=2023-01-01T00:00:00Z
    scheduled_before: Optional[datetime] = None, # e.g. ?scheduled_before=2023-01-31T23:59:59Z
    current_user: models.User = Depends(get_current_active_user)
):
    workspace = get_workspace_if_member(workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this workspace or workspace does not exist."
        )

    posts_in_workspace = [p for p in db["posts"] if p["workspace_id"] == workspace_id]

    filtered_posts = []
    for post_dict in posts_in_workspace:
        include = True
        if status_filter and post_dict["status"] != status_filter:
            include = False
        if scheduled_after and post_dict["scheduled_at"] and post_dict["scheduled_at"] < scheduled_after:
            include = False
        if scheduled_before and post_dict["scheduled_at"] and post_dict["scheduled_at"] > scheduled_before:
            include = False

        if include:
            filtered_posts.append(models.Post(**post_dict))

    return filtered_posts

def get_post_if_accessible(post_id: int, user_id: int, db_ref: dict) -> Dict[str, Any] | None:
    post_data = next((p for p in db_ref["posts"] if p["id"] == post_id), None)
    if not post_data:
        return None

    # Check if user is member of the workspace this post belongs to
    workspace_id = post_data["workspace_id"]
    if not get_workspace_if_member(workspace_id, user_id): # Uses db from global scope, fine for this structure
        return None

    return post_data

@app.put("/api/v1/posts/{post_id}", response_model=models.Post)
async def update_post(
    post_id: int,
    post_update_data: models.PostUpdate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_active_user)
):
    post_to_update = get_post_if_accessible(post_id, current_user.id, db)
    if not post_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found or user cannot access."
        )

    # Update fields if they are provided in post_update_data
    update_data = post_update_data.dict(exclude_unset=True) # .model_dump(exclude_unset=True) for Pydantic v2

    for key, value in update_data.items():
        if key == "media_urls" and value is not None:
            post_to_update[key] = [str(url) for url in value]
        elif value is not None: # Ensure not to wipe fields with None if not intended
            post_to_update[key] = value

    post_to_update["updated_at"] = datetime.utcnow()

    # If status is changed to 'scheduled' and scheduled_at is in the past/now, or if it's 'approved' (and meets criteria)
    # then trigger the background task.
    # This logic will be more refined in the approval workflow step.
    if post_to_update["status"] == "scheduled":
        if post_to_update["scheduled_at"] and post_to_update["scheduled_at"] <= datetime.utcnow():
            # If it's scheduled for now/past, it should attempt to publish.
            # However, simulate_publishing itself changes status from 'scheduled' to 'posted'.
            # So, if already 'scheduled' and time is up, the task will handle it.
             background_tasks.add_task(simulate_publishing, post_to_update["id"], db)
        # If scheduled for future, no immediate task.

    # If a post is directly 'approved' and meant to be published immediately after approval
    # This might be a specific flow. For now, 'approved' status usually precedes 'scheduled'.
    # Let's assume 'approved' posts need to be explicitly moved to 'scheduled' to get published.
    # The approval workflow step will handle this more clearly.

    # Find the index and update in the list (since db["posts"] contains dicts)
    for i, p_dict in enumerate(db["posts"]):
        if p_dict["id"] == post_id:
            db["posts"][i] = post_to_update
            break

    return models.Post(**post_to_update)

@app.delete("/api/v1/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: models.User = Depends(get_current_active_user)
):
    post_to_delete = get_post_if_accessible(post_id, current_user.id, db)
    if not post_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {post_id} not found or user cannot access."
        )

    # For prototype, only author or workspace manager can delete.
    # Workspace manager role check needs to be added to get_workspace_if_member or here.
    # For now, let's assume if they can access (member of workspace), they can delete.
    # A more granular check:
    # user_member_info = next((m for m in db["workspace_members"] if m["user_id"] == current_user.id and m["workspace_id"] == post_to_delete["workspace_id"]), None)
    # if not (post_to_delete["user_id"] == current_user.id or (user_member_info and user_member_info["role"] == "manager")):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to delete this post.")

    db["posts"] = [p for p in db["posts"] if p["id"] != post_id]
    return # No content response


# --- Helper to get user role in a workspace ---
def get_user_role_in_workspace(user_id: int, workspace_id: int, db_ref: dict) -> Optional[str]:
    member_info = next((
        m for m in db_ref["workspace_members"]
        if m["user_id"] == user_id and m["workspace_id"] == workspace_id
    ), None)
    return member_info["role"] if member_info else None

# --- Client Approval Workflow Endpoints ---

@app.post("/api/v1/posts/{post_id}/submit-for-approval", response_model=models.Post)
async def submit_post_for_approval(
    post_id: int,
    request_data: models.PostSubmitForApprovalRequest, # Even if empty, good for consistency
    current_user: models.User = Depends(get_current_active_user)
):
    post_to_update = get_post_if_accessible(post_id, current_user.id, db)
    if not post_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

    user_role = get_user_role_in_workspace(current_user.id, post_to_update["workspace_id"], db)
    # Typically managers or authors submit for approval
    is_author = post_to_update["user_id"] == current_user.id
    if not (user_role == "manager" or is_author):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to submit this post for approval.")

    if post_to_update["status"] not in ["draft", "needs_revision"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Post in status '{post_to_update['status']}' cannot be submitted for approval.")

    post_to_update["status"] = "pending_approval"
    post_to_update["updated_at"] = datetime.utcnow()
    # Optionally, store request_data.message if the model supports it, e.g., post_to_update["approval_request_message"] = request_data.message

    # Update in DB
    for i, p_dict in enumerate(db["posts"]):
        if p_dict["id"] == post_id:
            db["posts"][i] = post_to_update
            break
    return models.Post(**post_to_update)


@app.post("/api/v1/posts/{post_id}/approve", response_model=models.Post)
async def approve_post(
    post_id: int,
    request_data: models.PostApproveRequest, # Optional message
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_active_user)
):
    post_to_update = get_post_if_accessible(post_id, current_user.id, db)
    if not post_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

    user_role = get_user_role_in_workspace(current_user.id, post_to_update["workspace_id"], db)
    # Typically clients or managers (if client role is not strictly enforced for approval) approve
    if not (user_role == "client" or user_role == "manager"): # Allowing managers to also approve for flexibility
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to approve this post.")

    if post_to_update["status"] != "pending_approval":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Post in status '{post_to_update['status']}' cannot be approved.")

    # If the post has a scheduled_at time, it becomes 'scheduled', otherwise 'approved'
    if post_to_update.get("scheduled_at"):
        post_to_update["status"] = "scheduled"
        # If scheduled for now or in the past, trigger publishing
        if post_to_update["scheduled_at"] <= datetime.utcnow():
            background_tasks.add_task(simulate_publishing, post_to_update["id"], db)
    else:
        # If no scheduled time, it's just 'approved' - won't auto-publish
        post_to_update["status"] = "approved"

    post_to_update["updated_at"] = datetime.utcnow()
    # Optionally, store request_data.message

    for i, p_dict in enumerate(db["posts"]):
        if p_dict["id"] == post_id:
            db["posts"][i] = post_to_update
            break
    return models.Post(**post_to_update)


@app.post("/api/v1/posts/{post_id}/request-changes", response_model=models.Post)
async def request_changes_on_post(
    post_id: int,
    request_data: models.PostRequestChangesRequest,
    current_user: models.User = Depends(get_current_active_user)
):
    post_to_update = get_post_if_accessible(post_id, current_user.id, db)
    if not post_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

    user_role = get_user_role_in_workspace(current_user.id, post_to_update["workspace_id"], db)
    # Typically clients request changes
    if not (user_role == "client" or user_role == "manager"): # Allowing managers also to send back to draft essentially
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to request changes for this post.")

    if post_to_update["status"] != "pending_approval":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Changes can only be requested for posts in 'pending_approval' status.")

    post_to_update["status"] = "needs_revision"
    post_to_update["updated_at"] = datetime.utcnow()

    # Store feedback simply, e.g., in a new field or overwrite a 'last_feedback' field
    # For prototype, let's add a 'latest_feedback' field to the post dictionary if it doesn't exist
    post_to_update["latest_feedback"] = request_data.comments
    # To make this Pydantic-valid for response, Post model would need 'latest_feedback: Optional[str]'

    # Ensure the Post model can handle this new field if we want it in the response.
    # For now, we'll add it to the dict, but the response model might not show it unless updated.
    # To keep it simple and avoid model changes now, the feedback is stored in the DB
    # but might not be directly in the response model unless models.Post is adapted.

    for i, p_dict in enumerate(db["posts"]):
        if p_dict["id"] == post_id:
            db["posts"][i] = post_to_update
            break

    # If models.Post doesn't have 'latest_feedback', this will still work for storage,
    # but the response will be cast to models.Post structure.
    return models.Post(**post_to_update)


# --- Mock AI Content Assistant Endpoints ---

@app.post("/api/v1/ai/generate-caption", response_model=models.AIGenerateCaptionResponse)
async def generate_caption(
    request_data: models.AIGenerateCaptionRequest, # Input might be ignored for mock
    current_user: models.User = Depends(get_current_active_user) # Protected endpoint
):
    # Mock logic: ignore request_data.prompt, tone, platform for now
    fake_captions = [
        "✨ This is a brilliant AI-generated caption for your amazing post! ✨ #AICaption #SociaLoomMagic",
        "🚀 Elevate your social media game with this insightful caption, crafted by mock AI. 🚀",
        "💡 Get inspired! Here's a fresh take: 'Connecting with our audience, one post at a time.' #SocialMediaStrategy",
        "🎉 Celebrating a small win today! This caption is brought to you by SociaLoom's AI assistant."
    ]
    # Could add some variation based on request_data if desired, but not required by prompt.
    # For example: if request_data.platform == "Instagram": fake_captions.append("#InstagramReady")
    return models.AIGenerateCaptionResponse(captions=fake_captions)

@app.post("/api/v1/ai/generate-hashtags", response_model=models.AIGenerateHashtagsResponse)
async def generate_hashtags(
    request_data: models.AIGenerateHashtagsRequest, # Input might be ignored for mock
    current_user: models.User = Depends(get_current_active_user) # Protected endpoint
):
    # Mock logic: ignore request_data.keywords, platform for now
    base_hashtags = ["#localprototype", "#fakedata", "#webapp", "#socialmediamarketing", "#SociaLoomAI"]

    # Example of using input if available
    if request_data.keywords:
        for kw in request_data.keywords:
            # simple transformation for variety
            if kw.strip(): # ensure not empty string
                base_hashtags.append(f"#{kw.lower().replace(' ', '')}Rocks")

    if len(base_hashtags) > 10 : # Limit number of hashtags
        selected_hashtags = base_hashtags[:10]
    else:
        selected_hashtags = base_hashtags

    return models.AIGenerateHashtagsResponse(hashtags=selected_hashtags)

@app.post("/api/v1/ai/generate-ideas", response_model=models.AIGenerateIdeasResponse)
async def generate_ideas(
    request_data: models.AIGenerateIdeasRequest, # Input might be used lightly
    current_user: models.User = Depends(get_current_active_user) # Protected endpoint
):
    # Mock logic
    ideas = [
        models.AIIdea(title="Run a Flash Contest", brief="A flash contest (e.g., for 24 hours) can create urgency and boost engagement quickly. Ask users to comment or share."),
        models.AIIdea(title="Post a 'Behind the Scenes' Story", brief="Show the human side of your brand. This could be a quick office tour, an employee spotlight, or the making of a product."),
        models.AIIdea(title="Share a Customer Testimonial", brief="User-generated content and testimonials build trust. Make it visually appealing."),
        models.AIIdea(title="Ask an Engaging Question", brief="Pose a question related to your industry or your audience's interests to spark conversation.")
    ]

    if request_data.topic:
        ideas.append(models.AIIdea(
            title=f"Special Idea for {request_data.topic.capitalize()}",
            brief=f"Brainstorm content specifically around '{request_data.topic}'. This AI suggests exploring related current events or user pain points."
        ))

    return models.AIGenerateIdeasResponse(ideas=ideas)
