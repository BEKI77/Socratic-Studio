from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.models.user import User, Chat, Message
from app.rag.vector_store import search_documents_db
from app.services.socratic_service import generate_socratic_response

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    student_solution: str = ""
    chat_id: Optional[int] = None

class MessageResponse(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: int
    title: str
    messages: List[MessageResponse]

    class Config:
        from_attributes = True

@router.post("/chat", response_model=MessageResponse)
async def chat(
    request: ChatRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Get or create chat session
    if request.chat_id:
        chat_obj = db.query(Chat).filter(Chat.id == request.chat_id, Chat.user_id == current_user.id).first()
        if not chat_obj:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        # Create a new chat session if no chat_id provided
        # Title could be the first question truncated
        title = request.question[:50] + ("..." if len(request.question) > 50 else "")
        chat_obj = Chat(user_id=current_user.id, title=title)
        db.add(chat_obj)
        db.commit()
        db.refresh(chat_obj)

    # 2. Save user message
    user_msg = Message(chat_id=chat_obj.id, role="user", content=request.question)
    db.add(user_msg)
    
    # 3. Search DB (RAG) - Filtered by user
    chunks = search_documents_db(request.question, user_id=current_user.id)
    
    if not chunks:
        response_text = "I haven't studied that yet. Upload some notes!"
    else:
        # 4. Call the Model Service
        response_text = await generate_socratic_response(request.question, chunks, request.student_solution)
    
    # 5. Save assistant message
    assistant_msg = Message(chat_id=chat_obj.id, role="assistant", content=response_text)
    db.add(assistant_msg)
    db.commit()
    
    return MessageResponse(role="assistant", content=response_text)

@router.get("/sessions", response_model=List[ChatResponse])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.updated_at.desc()).all()
    return chats

@router.get("/sessions/{chat_id}", response_model=ChatResponse)
def get_chat_session(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat_obj = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat_obj:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return chat_obj