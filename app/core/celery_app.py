from celery import Celery
from kombu import Queue

from .config import settings
from ..database import SessionLocal
from ..crud import crud_post
from .. import models

# Initialize Celery
celery_app = Celery(
    __name__,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=['app.core.celery_app'] # Points to this module for task discovery
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],  # Ignore other content
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    # Define a default queue, but tasks can specify their own
    task_default_queue='default',
    task_queues=(
        Queue('default'),
        Queue('social_posting'),
    )
)

@celery_app.task(name="publish_post_task", bind=True, max_retries=3, default_retry_delay=60, queue='social_posting')
def publish_post_task(self, post_id: int):
    """
    Celery task to publish a post to a social media platform.
    """
    db = SessionLocal()
    try:
        post = crud_post.get_post(db, post_id)
        if not post:
            print(f"Post ID {post_id} not found. Task cannot proceed.")
            # Potentially mark as error or handle differently
            return f"Error: Post ID {post_id} not found."

        if post.status != models.PostStatus.SCHEDULED:
            print(f"Post ID {post_id} is not in 'scheduled' status (current: {post.status}). Skipping.")
            return f"Skipped: Post ID {post_id} status is {post.status}."

        connected_account = post.connected_account
        if not connected_account or not connected_account.is_active:
            crud_post.update_post_status(db, post_id, models.PostStatus.ERROR, "Connected account is inactive or missing.")
            print(f"Error for Post ID {post_id}: Connected account inactive or missing.")
            return f"Error: Connected account for Post ID {post_id} inactive/missing."

        # Decrypt token (already handled by @property in model)
        access_token = connected_account.access_token
        platform_name = connected_account.platform.name.lower()

        print(f"Attempting to publish Post ID {post_id} to {platform_name} for account {connected_account.platform_account_name} ({connected_account.platform_account_id})")
        print(f"Content: {post.content_text[:50]}...")
        # print(f"Access Token (masked): {access_token[:5]}...{access_token[-5:]}") # For debug, be careful with real tokens

        # TODO: Implement actual API call logic for each platform
        # This is a placeholder for platform-specific API interaction
        platform_post_id_from_api = None
        try:
            if platform_name == "facebook":
                # from ..services.facebook_service import post_to_facebook # Example
                # platform_post_id_from_api = post_to_facebook(access_token, connected_account.platform_account_id, post.content_text, post.media_url)
                print(f"[SIMULATE] Posting to Facebook for Post ID {post_id}")
                platform_post_id_from_api = f"fb_sim_{post_id}"
                pass
            elif platform_name == "twitter":
                # from ..services.twitter_service import post_to_twitter # Example
                # platform_post_id_from_api = post_to_twitter(access_token, post.content_text, post.media_url)
                print(f"[SIMULATE] Posting to Twitter for Post ID {post_id}")
                platform_post_id_from_api = f"tw_sim_{post_id}"
                pass
            elif platform_name == "instagram":
                print(f"[SIMULATE] Posting to Instagram for Post ID {post_id}")
                platform_post_id_from_api = f"ig_sim_{post_id}"
                pass
            elif platform_name == "linkedin":
                print(f"[SIMULATE] Posting to LinkedIn for Post ID {post_id}")
                platform_post_id_from_api = f"li_sim_{post_id}"
                pass                
            else:
                raise NotImplementedError(f"Platform '{platform_name}' not supported for automated posting.")
            
            # If successful:
            crud_post.update_post_status(db, post_id, models.PostStatus.POSTED, platform_post_id=platform_post_id_from_api)
            print(f"Successfully posted Post ID {post_id} to {platform_name}. Platform Post ID: {platform_post_id_from_api}")
            return f"Success: Post ID {post_id} published to {platform_name}."

        except Exception as e:
            print(f"API Error for Post ID {post_id} on {platform_name}: {str(e)}")
            crud_post.update_post_status(db, post_id, models.PostStatus.ERROR, str(e))
            # Retry logic is handled by Celery's `bind=True, max_retries, default_retry_delay`
            # self.retry(exc=e) # This would trigger a retry
            raise # Re-raise to let Celery handle retry based on task decorator settings

    except Exception as e:
        # Catch-all for unexpected errors during task execution (e.g., DB issues before API call)
        print(f"General Error in publish_post_task for Post ID {post_id}: {str(e)}")
        # Attempt to mark post as error if possible, but the DB session might be compromised
        try:
            crud_post.update_post_status(db, post_id, models.PostStatus.ERROR, f"Task execution error: {str(e)}")
        except Exception as db_error:
            print(f"Failed to update post status to ERROR for Post ID {post_id} after general task error: {db_error}")
        # self.retry(exc=e) # Consider if retryable
        raise # Re-raise to let Celery handle retry
    finally:
        db.close()

# To run Celery worker (example command, adjust as needed):
# celery -A app.core.celery_app worker -l info -Q social_posting,default
# celery -A app.main.celery_app worker -l INFO  (if celery_app is exposed via main)