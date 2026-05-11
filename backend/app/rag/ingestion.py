import os
import uuid
from typing import Optional
from fastapi import UploadFile
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from app.rag.document_loader import load_document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.vector_store import add_documents_to_db
from app.core.config import settings

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,    # Target ~1000 tokens
    chunk_overlap=200,  # Ensure context continuity between chunks
    separators=["\n\n", "\n", ". ", " ", ""]
)

embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Configure PGVector Store
CONNECTION_STRING = settings.DATABASE_URL # e.g., postgresql+psycopg://user:pass@host:port/dbname
COLLECTION_NAME = "socratic_tutor_collection"

vector_store = PGVector(
    embeddings=embeddings_model,
    connection=str(CONNECTION_STRING),
    collection_name=COLLECTION_NAME,
)

# 3. Process and Ingest
async def ingest_uploaded_file(file: UploadFile, user_id: Optional[int] = None):
    temp_path = f"temp_{file.filename}"
    try:
        # Write file to disk
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Load and Split
        docs = load_document(temp_path)
        chunks = text_splitter.split_documents(docs)
        
        # Generate a unique document ID
        doc_uuid = str(uuid.uuid4())
        
        # Add to DB
        # Inject both doc_id and source into metadata
        for chunk in chunks:
            chunk.metadata["doc_id"] = doc_uuid
            chunk.metadata["source"] = file.filename

        add_documents_to_db(chunks, user_id=user_id)
        
        # RETURN a dictionary that matches the DocumentSummary interface
        return {
            "id": doc_uuid,
            "name": file.filename,
            "chunkCount": len(chunks),
            "status": "success"
        }

    finally:
        # Using 'finally' ensures the temp file is deleted 
        # even if the code above crashes.
        if os.path.exists(temp_path):
            os.remove(temp_path)