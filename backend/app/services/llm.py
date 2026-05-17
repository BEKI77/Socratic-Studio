from groq import AsyncGroq
from app.core.config import settings

# Groq client is initialized once and reused
client = AsyncGroq(api_key=settings.GROQ_API_KEY)


async def generate_socratic_response(question: str, context_chunks: list) -> str:
    """
    Generates a Socratic tutoring response using Groq's LLM API.
    Uses retrieved document chunks as grounding context.
    """
    # 1. Format retrieved context for the prompt
    context_text = "\n\n".join([doc.page_content for doc in context_chunks])

    # 2. Build messages using the chat format Groq expects
    messages = [
        {
            "role": "system",
            "content": (
                "You are a Socratic tutor. Instead of giving direct answers, "
                "guide the student to discover the answer themselves through "
                "thoughtful questions and hints. Use ONLY the provided context "
                "to ground your responses. If the context doesn't cover the topic, "
                "say so honestly rather than guessing."
            ),
        },
        {
            "role": "user",
            "content": (
                f"### CONTEXT FROM STUDENT'S MATERIALS\n{context_text}\n\n"
                f"### STUDENT'S QUESTION\n{question}\n\n"
                "Please respond in the Socratic style — ask guiding questions "
                "rather than stating the answer outright."
            ),
        },
    ]

    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.4,      # Low temp = more focused, less hallucination
            max_tokens=512,       # Enough for a helpful Socratic reply
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"CRITICAL ERROR calling Groq: {type(e).__name__}: {e}")
        # Distinguish common failure modes for easier debugging
        err = str(e).lower()
        if "auth" in err or "api key" in err:
            return "Error: Invalid Groq API key. Check your .env file."
        if "model" in err:
            return f"Error: Model '{settings.GROQ_MODEL}' not found on Groq."
        if "rate" in err:
            return "Error: Groq rate limit hit. Please wait a moment and try again."
        return f"Technical Error: {type(e).__name__} — check your terminal for details."