"""
AI service implementation using Groq (instead of Ollama)
This is a temporary implementation for testing without Docker/Ollama.
"""

from groq import Groq
import os

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not set in environment variables")

client = Groq(api_key=GROQ_API_KEY)

async def generate_socratic_response(question: str, context_chunks: list) -> str:
    """
    Generates a socratic tutoring response using Groq API.
    
    Args:
        question: The student's question
        context_chunks: List of LangChain Document objects from RAG
        
    Returns:
        The AI response from Groq
    """
    
    # 1. Format the retrieved context
    context_text = "\n".join([doc.page_content for doc in context_chunks])
    
    system_prompt = """You are a Socratic tutor. Your role is to:
1. Help students learn by asking guiding questions rather than giving direct answers
2. Build on the provided context/materials to guide the student's thinking
3. Encourage critical thinking and deeper understanding
4. Be encouraging and supportive

Keep responses concise (2-3 sentences typically) and focus on guiding questions or small hints rather than full answers."""
    
    user_prompt = f"""CONTEXT FROM MATERIALS:
{context_text}

STUDENT'S QUESTION:
{question}

Provide a helpful, socratic response that guides the student to think about the answer."""

    try:
        # Use Groq's chat completions API (compatible with OpenAI format)
        message = client.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=256,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,  # Lower temperature = less hallucination
        )
        
        # Extract response text from the choice
        response_text = message.choices[0].message.content if message.choices else "I couldn't generate a response."
        print(f"✓ Generated response from Groq ({GROQ_MODEL})")
        return response_text
        
    except Exception as e:
        print(f"✗ Groq API Error: {type(e).__name__}: {e}")
        error_message = f"I encountered an issue: {type(e).__name__}. Please check your API key and try again."
        return error_message
