from fastapi import APIRouter, HTTPException, Depends
from app.models.chats import ChatRequest
# from app.services.socratic_service import generate_socratic_response
from app.rag.vector_store import search_documents_db
from app.services.socratic_service import generate_socratic_response

# Define the router for this module
router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    # 1. Search DB (RAG)
    chunks = search_documents_db(request.question)
    
    if not chunks:
        return {"response": "I haven't studied that yet. Upload some notes!"}

    # 2. Call the Model Service
    socratic_answer = await generate_socratic_response(request.question, chunks)
    
    return {
        "response": socratic_answer,
        "sources": [doc.metadata.get("source") for doc in chunks]
    }