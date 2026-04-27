from fastapi import APIRouter, File, UploadFile, HTTPException
from app.rag.ingestion import ingest_uploaded_file # Your new logic
from app.rag.vector_store import list_documents_db

router = APIRouter()

@router.get("/documents")
def get_documents():
    # Call your new DB-backed list function
    return {"documents": list_documents_db()}

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