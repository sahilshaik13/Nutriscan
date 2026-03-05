import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import httpx
import os
import json
import re
import asyncio

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    health_profile: dict | None = None
    food_name_hint: str | None = None

class FollowUpRequest(BaseModel):
    food_name: str
    initial_ingredients: list[str]
    answers: dict[str, str]
    health_profile: dict | None = None

class QuickAnalyzeRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    health_profile: dict | None = None

def parse_json_response(response_text: str) -> dict:
    """Extract and parse JSON from response text"""
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
    if json_match:
        response_text = json_match.group(1)
    
    response_text = response_text.strip()
    return json.loads(response_text)

def build_health_context(health_profile: dict | None) -> str:
    """Build health profile context string for prompts"""
    if not health_profile:
        return ""
    
    profile_parts = []
    if health_profile.get('allergies'):
        profile_parts.append(f"- Allergies: {', '.join(health_profile['allergies'])}")
    if health_profile.get('intolerances'):
        profile_parts.append(f"- Intolerances: {', '.join(health_profile['intolerances'])}")
    if health_profile.get('medical_conditions'):
        profile_parts.append(f"- Medical Conditions: {', '.join(health_profile['medical_conditions'])}")
    if health_profile.get('dietary_lifestyles'):
        profile_parts.append(f"- Dietary Preferences: {', '.join(health_profile['dietary_lifestyles'])}")
    
    if profile_parts:
        return "\n\nUser Health Profile:\n" + "\n".join(profile_parts)
    return ""

async def call_gemini_api(contents: list, max_retries: int = 3) -> str:
    """Call Gemini API with retry logic for rate limiting"""
    if not GEMINI_API_KEY:
        raise fastapi.HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "topK": 32,
            "topP": 1,
            "maxOutputTokens": 8192,
        }
    }
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                
                if response.status_code == 429:
                    wait_time = (2 ** attempt) * 2
                    await asyncio.sleep(wait_time)
                    continue
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise fastapi.HTTPException(status_code=500, detail=f"Gemini API error: {response.status_code}")
                
                result = response.json()
                
                if "candidates" not in result or len(result["candidates"]) == 0:
                    raise fastapi.HTTPException(status_code=500, detail="No response from Gemini")
                
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text
                
        except httpx.TimeoutException:
            last_error = "Request timed out"
            await asyncio.sleep(2)
        except fastapi.HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            await asyncio.sleep(2)
    
    raise fastapi.HTTPException(status_code=500, detail=f"Failed after {max_retries} attempts: {last_error}")

@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """Initial food image analysis to identify food and ingredients"""
    try:
        health_context = build_health_context(request.health_profile)
        
        # Include food name hint if provided
        food_hint = ""
        if request.food_name_hint:
            food_hint = f"\nIMPORTANT: The user has indicated this food product is or may be: '{request.food_name_hint}'. Use this information to guide your analysis."
        
        prompt = f"""Analyze this food image and provide:
1. The name of the food/dish
2. A list of likely ingredients you can identify or reasonably infer
3. The approximate serving size visible
{food_hint}
{health_context}

Respond in JSON format only (no markdown, no code blocks):
{{
    "food_name": "name of the dish",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "serving_size": "approximate serving size",
    "confidence": "high/medium/low",
    "questions": [
        {{
            "id": "q1",
            "question": "specific question to improve accuracy",
            "type": "single_choice" or "specify",
            "options": ["option1", "option2", "option3"],
            "allow_specify": true or false,
            "specify_placeholder": "e.g., 250g" (only if allow_specify is true)
        }}
    ]
}}

IMPORTANT: Generate 3-5 highly relevant questions that would significantly impact the nutritional analysis:

1. ALWAYS include a portion/weight question with "allow_specify": true so users can input exact weights like "150g", "2 cups", etc.
   Example: {{"id": "portion", "question": "What's the portion size?", "type": "single_choice", "options": ["Small (100g)", "Medium (200g)", "Large (300g)"], "allow_specify": true, "specify_placeholder": "Enter exact weight (e.g., 175g)"}}

2. Ask about cooking method if it affects nutrition (fried vs baked vs steamed)

3. Ask about specific ingredients if they vary (type of oil, added sugar, cheese type)
   For variable ingredients, include "allow_specify": true
   Example: {{"id": "oil", "question": "What type of oil was used?", "type": "single_choice", "options": ["Olive oil", "Vegetable oil", "Butter", "No oil"], "allow_specify": true, "specify_placeholder": "Specify other oil type"}}

4. Ask about additions/toppings that impact nutrition

5. If user has allergies/dietary restrictions, ask about ingredient substitutions

Set "allow_specify": true for questions where exact values matter (weight, specific ingredients)."""
        
        contents = [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": request.mime_type,
                        "data": request.image_base64
                    }
                }
            ]
        }]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise fastapi.HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate-nutrition")
async def calculate_nutrition(request: FollowUpRequest):
    """Calculate detailed nutrition based on food identification and user answers"""
    try:
        answers_text = "\n".join([f"- {k}: {v}" for k, v in request.answers.items()])
        health_context = build_health_context(request.health_profile)
        
        # Build personalized impact section based on health profile
        personalized_prompt = ""
        if request.health_profile:
            conditions = []
            if request.health_profile.get('allergies'):
                conditions.extend(request.health_profile['allergies'])
            if request.health_profile.get('intolerances'):
                conditions.extend(request.health_profile['intolerances'])
            if request.health_profile.get('medical_conditions'):
                conditions.extend(request.health_profile['medical_conditions'])
            if request.health_profile.get('dietary_lifestyles'):
                conditions.extend(request.health_profile['dietary_lifestyles'])
            
            if conditions:
                personalized_prompt = f"""
CRITICAL: The user has the following health conditions/preferences: {', '.join(conditions)}

You MUST analyze how this specific food affects their conditions and include in your response:
- "personal_health_impacts": An array of objects, each with:
  - "condition": the specific allergy/intolerance/medical condition/dietary preference
  - "impact_level": "safe", "caution", "warning", or "danger"
  - "explanation": detailed explanation of how this food affects this condition
  - "ingredients_of_concern": list of specific ingredients that trigger this concern

For example, if user has "Diabetes" and food has sugar:
{{"condition": "Diabetes", "impact_level": "caution", "explanation": "This food contains 15g of sugar which may spike blood glucose levels. Consider eating with protein to slow absorption.", "ingredients_of_concern": ["sugar", "refined flour"]}}

Be very specific and medically accurate. Flag ALL relevant concerns."""
        
        prompt = f"""Based on the following food analysis, provide detailed nutritional information:

Food: {request.food_name}
Identified Ingredients: {', '.join(request.initial_ingredients)}

User's answers to clarifying questions:
{answers_text}
{health_context}
{personalized_prompt}

Provide accurate nutritional estimates in JSON format only (no markdown, no code blocks):
{{
    "food_name": "{request.food_name}",
    "ingredients": ["final list of ingredients with specific types based on user answers"],
    "serving_size": "estimated serving size based on user's answer",
    "calories": number,
    "total_fat": grams as number,
    "saturated_fat": grams as number,
    "trans_fat": grams as number,
    "cholesterol": mg as number,
    "sodium": mg as number,
    "total_carbohydrates": grams as number,
    "dietary_fiber": grams as number,
    "total_sugars": grams as number,
    "added_sugars": grams as number,
    "protein": grams as number,
    "vitamin_d": mcg as number,
    "calcium": mg as number,
    "iron": mg as number,
    "potassium": mg as number,
    "health_score": 1-100 (100 being healthiest, consider user's health conditions),
    "health_rating": "Excellent/Good/Moderate/Poor/Very Poor",
    "health_insights": ["insight1", "insight2", "insight3"],
    "recommendations": ["recommendation1", "recommendation2"],
    "personal_health_impacts": [
        {{
            "condition": "condition name",
            "impact_level": "safe/caution/warning/danger",
            "explanation": "detailed explanation",
            "ingredients_of_concern": ["ingredient1", "ingredient2"]
        }}
    ]
}}

Be realistic with the nutritional values based on the specific portion size and preparation methods mentioned."""
        
        contents = [{"parts": [{"text": prompt}]}]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise fastapi.HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))

@app.post("/api/quick-analyze")
async def quick_analyze(request: QuickAnalyzeRequest):
    """Quick analysis that combines image analysis and nutrition calculation"""
    try:
        health_context = build_health_context(request.health_profile)
        
        personalized_prompt = ""
        if request.health_profile:
            conditions = []
            if request.health_profile.get('allergies'):
                conditions.extend(request.health_profile['allergies'])
            if request.health_profile.get('intolerances'):
                conditions.extend(request.health_profile['intolerances'])
            if request.health_profile.get('medical_conditions'):
                conditions.extend(request.health_profile['medical_conditions'])
            if request.health_profile.get('dietary_lifestyles'):
                conditions.extend(request.health_profile['dietary_lifestyles'])
            
            if conditions:
                personalized_prompt = f"""
CRITICAL: The user has the following health conditions/preferences: {', '.join(conditions)}

You MUST analyze how this specific food affects their conditions and include "personal_health_impacts" array with objects containing:
- "condition": the specific condition
- "impact_level": "safe", "caution", "warning", or "danger"  
- "explanation": detailed explanation
- "ingredients_of_concern": list of problematic ingredients"""
        
        prompt = f"""Analyze this food image and provide complete nutritional information.
{health_context}
{personalized_prompt}

Respond in JSON format only (no markdown, no code blocks):
{{
    "food_name": "name of the dish",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "serving_size": "estimated serving size",
    "calories": number,
    "total_fat": grams as number,
    "saturated_fat": grams as number,
    "trans_fat": grams as number,
    "cholesterol": mg as number,
    "sodium": mg as number,
    "total_carbohydrates": grams as number,
    "dietary_fiber": grams as number,
    "total_sugars": grams as number,
    "added_sugars": grams as number,
    "protein": grams as number,
    "vitamin_d": mcg as number,
    "calcium": mg as number,
    "iron": mg as number,
    "potassium": mg as number,
    "health_score": 1-100 (100 being healthiest),
    "health_rating": "Excellent/Good/Moderate/Poor/Very Poor",
    "health_insights": ["insight1", "insight2", "insight3"],
    "recommendations": ["recommendation1", "recommendation2"],
    "personal_health_impacts": [
        {{
            "condition": "condition name",
            "impact_level": "safe/caution/warning/danger",
            "explanation": "detailed explanation",
            "ingredients_of_concern": ["ingredient1", "ingredient2"]
        }}
    ]
}}

Be realistic with nutritional values. The health score should reflect overall nutritional quality considering the user's health profile."""
        
        contents = [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": request.mime_type,
                        "data": request.image_base64
                    }
                }
            ]
        }]
        
        response_text = await call_gemini_api(contents)
        result = parse_json_response(response_text)
        return result
        
    except fastapi.HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise fastapi.HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise fastapi.HTTPException(status_code=500, detail=str(e))
