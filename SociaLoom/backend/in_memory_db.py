# SociaLoom/backend/in_memory_db.py
db = {
    "users": [
        {"id": 1, "email": "manager@example.com", "hashed_password": "fake_password_hash", "is_client": False, "username": "Manager User"},
        {"id": 2, "email": "client@example.com", "hashed_password": "fake_password_hash", "is_client": True, "username": "Client User"}
    ],
    "workspaces": [
        {"id": 1, "name": "Client A's Brand", "owner_id": 1},
    ],
    "workspace_members": [
        {"user_id": 1, "workspace_id": 1, "role": "manager"},
        {"user_id": 2, "workspace_id": 1, "role": "client"}
    ],
    "connected_accounts": [
         {"id": 1, "workspace_id": 1, "platform_name": "Instagram", "username": "ClientA_Insta", "access_token": "fake_ig_token"},
         {"id": 2, "workspace_id": 1, "platform_name": "Facebook", "username": "ClientA_FB", "access_token": "fake_fb_token"}
    ],
    "posts": [], # Start with an empty list for posts
    # Example post structure for reference (will be created via API)
    # {
    #     "id": 1,
    #     "workspace_id": 1,
    #     "user_id": 1, # Author
    #     "connected_account_ids": [1], # List of connected account IDs to publish to
    #     "content": "This is a sample post!",
    #     "media_urls": ["http://example.com/image.jpg"],
    #     "status": "draft", # draft, pending_approval, needs_revision, approved, scheduled, posted, failed
    #     "scheduled_at": "2024-12-01T10:00:00Z", # ISO 8601 format
    #     "created_at": "2024-11-20T10:00:00Z",
    #     "updated_at": "2024-11-20T10:00:00Z",
    #     "approval_requests": [
    #         # {"requested_by_id": 1, "requested_to_id": 2, "status": "pending", "comments": ""}
    #     ],
    #     "client_feedback": [
    #         # {"user_id": 2, "comment": "Please change X", "requested_at": "..."}
    #     ]
    # }
}

# Utility functions to get next ID for new items
def get_next_id(table_name):
    if db[table_name]:
        return max(item["id"] for item in db[table_name]) + 1
    return 1
