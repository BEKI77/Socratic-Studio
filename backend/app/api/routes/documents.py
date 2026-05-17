from fastapi import APIRouter, File, UploadFile, HTTPException
from app.rag.ingestion import ingest_uploaded_file # Your new logic
from app.services.llm import generate_socratic_response
from app.services.vector_store import list_documents_db, get_document_chunks, search_documents_db, add_documents_to_db
router = APIRouter()

@router.get("/documents")
def get_documents():
    # Call your new DB-backed list function
    return {"documents": list_documents_db()}

@router.get("/documents/{source:path}")
def get_document(source: str):
    chunks = get_document_chunks(source)
    if not chunks:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"source": source, "chunks": chunks}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Upload a valid file.")
    
    # Delegate the heavy lifting to your ingestion service
    # This keeps the route clean and focused on HTTP concerns
    try:
        result = await ingest_uploaded_file(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))