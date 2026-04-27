from fastapi import APIRouter, HTTPException, Depends
from app.models.chats import ChatRequest
# from app.services.socratic_service import generate_socratic_response
from app.rag.vector_store import search_documents_db

# Define the router for this module
router = APIRouter()

@router.post("/chat")
def chat(request: ChatRequest):
    """
    Endpoint to process student questions using RAG and Socratic prompting.
    """
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Ask a question to begin.")

    # 1. Retrieve relevant context from PostgreSQL/pgvector
    chunks = search_documents_db(question, top_k=4)
    
    if not chunks:
        return {
            "response": "I don't have any documents yet. Upload lecture notes so I can reason with them.",
            "sources": [],
        }

    # 2. Use the Service Layer to generate the pedagogical Socratic response
    # This separates the 'API' from the 'Tutoring Logic'
    # response_data = generate_socratic_response(question, chunks)
    return 
    # return response_data