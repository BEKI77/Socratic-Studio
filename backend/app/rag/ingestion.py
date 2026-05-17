import os
from fastapi import UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.document_loader import load_document
from app.services.vector_store import add_documents_to_db

# Text splitter — no database connection needed here
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)

async def ingest_uploaded_file(file: UploadFile):
    temp_path = f"temp_{file.filename}"
    try:
        # Write uploaded file to disk temporarily
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        # Load and split into chunks
        docs = load_document(temp_path)
        chunks = text_splitter.split_documents(docs)

        # Send to Pinecone via vector_store service
        add_documents_to_db(chunks)

        return {
            "status": "success",
            "filename": file.filename,
            "chunks_ingested": len(chunks)
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)