from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.rag.ingestion import ingest_uploaded_file # Your new logic
from app.rag.vector_store import list_documents_db, get_document_chunks

router = APIRouter()

@router.get("/documents")
def get_documents(current_user: User = Depends(get_current_user)):
    # Call your new DB-backed list function
    return {"documents": list_documents_db(user_id=current_user.id)}

@router.get("/documents/{source:path}")
def get_document(source: str, current_user: User = Depends(get_current_user)):
    chunks = get_document_chunks(source, user_id=current_user.id)
    if not chunks:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"source": source, "chunks": chunks}

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Upload a valid file.")
    
    # Delegate the heavy lifting to your ingestion service
    # This keeps the route clean and focused on HTTP concerns
    try:
        result = await ingest_uploaded_file(file, user_id=current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))