import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app import schemas # Updated import
from app.core.config import settings
# from app.dependencies import get_db, get_current_active_user # Assuming you have these

router = APIRouter()

# Configure the Gemini API key at the module level or within a dependency
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Optional: Check if the API key is valid by making a simple model list call
        # models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        # if not models:
        #     print("Warning: No models found that support 'generateContent'. Check API key and permissions.")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}. Ensure GEMINI_API_KEY is set correctly.")
        # Depending on policy, you might want to raise an error here or allow app to start
else:
    print("Warning: GEMINI_API_KEY not found in settings. AI features will not work.")

# Placeholder for Gemini model - choose an appropriate one
# For text generation, 'gemini-pro' is a common choice.
# Ensure the model you choose supports the type of generation you need.
GENERATIVE_MODEL_NAME = "gemini-1.0-pro" # Or "gemini-pro", "gemini-1.5-flash-latest" etc.

@router.post("/generate-caption", response_model=schemas.AIGeneratedCaptionsResponse)
async def generate_caption(
    request: schemas.AICaptionRequest,
    # current_user: models.User = Depends(get_current_active_user) # Protect endpoint
):
    if not settings.GEMINI_API_KEY or not genai.get_model(GENERATIVE_MODEL_NAME):
        raise HTTPException(status_code=503, detail="AI service is not configured or unavailable.")

    prompt_template = f"Generate 3 distinct social media captions for a post about: '{request.prompt}'. The tone should be {request.tone}. Each caption should be concise and engaging. Return as a numbered list."
    
    try:
        model = genai.GenerativeModel(GENERATIVE_MODEL_NAME)
        response = await model.generate_content_async(prompt_template)
        
        # Basic parsing assuming Gemini returns text that can be split into a list
        # This might need refinement based on actual Gemini API response format
        captions = []
        if response.text:
            # Attempt to parse numbered or bulleted lists
            raw_captions = response.text.strip().split('\n')
            for cap in raw_captions:
                cap_cleaned = cap.strip()
                # Remove potential numbering like "1. ", "- ", "* "
                if cap_cleaned and cap_cleaned[0].isdigit() and '.' in cap_cleaned[:3]:
                    cap_cleaned = cap_cleaned.split('.', 1)[-1].strip()
                elif cap_cleaned and cap_cleaned[0] in ['-', '*']:
                    cap_cleaned = cap_cleaned[1:].strip()
                if cap_cleaned:
                    captions.append(cap_cleaned)
        
        if not captions:
             # Fallback if parsing fails or response is not as expected
            captions = [response.text.strip()] if response.text else ["Could not generate captions at this time."]

        return schemas.AIGeneratedCaptionsResponse(captions=captions)
    except Exception as e:
        print(f"Error calling Gemini API for captions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate captions: {str(e)}")

@router.post("/generate-hashtags", response_model=schemas.AIGeneratedHashtagsResponse)
async def generate_hashtags(
    request: schemas.AIHashtagRequest,
    # current_user: models.User = Depends(get_current_active_user)
):
    if not settings.GEMINI_API_KEY or not genai.get_model(GENERATIVE_MODEL_NAME):
        raise HTTPException(status_code=503, detail="AI service is not configured or unavailable.")

    prompt_template = f"Based on the following social media post content, generate 15 relevant and trending hashtags. Prioritize a mix of broad and niche tags. Return as a comma-separated list: '{request.post_content}'"
    
    try:
        model = genai.GenerativeModel(GENERATIVE_MODEL_NAME)
        response = await model.generate_content_async(prompt_template)
        
        hashtags = []
        if response.text:
            # Assuming Gemini returns a comma-separated string of hashtags
            hashtags = [tag.strip().replace('#', '') for tag in response.text.split(',') if tag.strip()]
            hashtags = [f"#{tag}" for tag in hashtags if tag] # Ensure '#' prefix and non-empty
        
        if not hashtags:
            hashtags = ["#general"] # Fallback
            
        return schemas.AIGeneratedHashtagsResponse(hashtags=list(set(hashtags))[:15]) # Ensure unique and limit
    except Exception as e:
        print(f"Error calling Gemini API for hashtags: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate hashtags: {str(e)}")

@router.post("/generate-ideas", response_model=schemas.AIGeneratedIdeasResponse)
async def generate_ideas(
    request: schemas.AIIdeaRequest,
    # current_user: models.User = Depends(get_current_active_user)
):
    if not settings.GEMINI_API_KEY or not genai.get_model(GENERATIVE_MODEL_NAME):
        raise HTTPException(status_code=503, detail="AI service is not configured or unavailable.")

    prompt_template = f"Generate 5 distinct social media post ideas on the topic of '{request.topic}'. For each idea, provide a short, catchy title and a brief (1-2 sentences) description or angle for the post. Format each idea with 'Title:' and 'Brief:' labels."
    
    try:
        model = genai.GenerativeModel(GENERATIVE_MODEL_NAME)
        response = await model.generate_content_async(prompt_template)
        
        ideas = []
        if response.text:
            # This parsing is highly dependent on Gemini's output format. 
            # It might need significant refinement.
            content_blocks = response.text.strip().split('\n\n') # Assuming ideas are separated by double newlines
            for block in content_blocks:
                title = None
                brief = None
                lines = block.split('\n')
                for line in lines:
                    if line.lower().startswith("title:"):
                        title = line.split(":", 1)[1].strip()
                    elif line.lower().startswith("brief:"):
                        brief = line.split(":", 1)[1].strip()
                if title and brief:
                    ideas.append(schemas.PostIdea(title=title, brief=brief))
        
        if not ideas and response.text: # Fallback if parsing fails
            ideas.append(schemas.PostIdea(title="General Idea", brief=response.text.strip()))
        elif not ideas:
            ideas.append(schemas.PostIdea(title="Error", brief="Could not generate ideas at this time."))
            
        return schemas.AIGeneratedIdeasResponse(ideas=ideas[:5]) # Limit to 5 ideas
    except Exception as e:
        print(f"Error calling Gemini API for ideas: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")

# Note: You'll need to add `GEMINI_API_KEY="your_actual_api_key"` to your .env file
# and ensure `google-generativeai` is in your requirements.txt and installed.