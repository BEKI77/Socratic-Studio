import httpx
from app.core.config import settings 

async def generate_socratic_response(question: str, context_chunks: list):
    # 1. Format the retrieved context
    # We label this clearly so the model knows these are the facts it must use.
    context_text = "\n".join([doc.page_content for doc in context_chunks])
    
    prompt = f"""
### CONTEXT
{context_text}

### STUDENT INPUT
{question}

### ASSISTANT RESPONSE
"""

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.model_api_url, 
                json={
                    "model": "socratic-tutor",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.4,  # Lower temperature = less hallucination
                        "num_predict": 256   # Limits response length to keep it concise
                    }
                },
                timeout=30.0 
            )
            
            response.raise_for_status()
            return response.json().get("response")
            
        except httpx.HTTPStatusError as e:
            return f"Error from model server: {e.response.status_code}"
        except Exception:
            return "I'm having trouble connecting to my brain. Please try again."