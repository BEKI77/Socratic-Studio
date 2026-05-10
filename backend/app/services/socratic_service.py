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
                    "model": "socratic-phi",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.4,  # Lower temperature = less hallucination
                        "num_predict": 256   # Limits response length to keep it concise
                    }
                },
                timeout=100.0 
            )
            
            response.raise_for_status()
            return response.json().get("response")
            
        except httpx.TimeoutException:
            return "The model took too long to respond. Check if your computer is lagging."
        except httpx.ConnectError:
            return "Could not reach Ollama. Is it running on the correct port?"
        except Exception as e:
            # This will print the REAL error in your terminal/command prompt
            print(f"CRITICAL ERROR: {type(e).__name__}: {e}")
            return f"Technical Error: {type(e).__name__}"