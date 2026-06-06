from typing import List, Set, Optional
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
import os
from app.core.config import settings

# 1. Initialize the embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Configure the connection
CONNECTION_STRING = settings.DATABASE_URL

print(f"DEBUG: Connection string is: {CONNECTION_STRING}")

COLLECTION_NAME = "socratic_tutor_collection"

# 3. Create the vector store interface
vector_store = PGVector(
    embeddings=embeddings,
    connection=str(CONNECTION_STRING),
    collection_name=COLLECTION_NAME,
    create_extension=False, 
    use_jsonb=True
)

def add_documents_to_db(chunks: List[Document], user_id: Optional[int] = None):
    """
    Takes a list of LangChain Document objects, 
    embeds them, and inserts them into PGVector.
    """
    if user_id:
        for chunk in chunks:
            chunk.metadata["user_id"] = user_id
    try:
        # PGVector handles the embedding calculation and the SQL INSERT
        vector_store.add_documents(chunks)
        print(f"Successfully added {len(chunks)} chunks to PostgreSQL.")
    except Exception as e:
        print(f"Error adding documents to PGVector: {e}")
        raise

def search_documents_db(query: str, top_k: int = 4, user_id: Optional[int] = None) -> List[Document]:
    """
    Queries the vector store for the most similar chunks.
    """
    filter = None
    if user_id:
        filter = {"user_id": user_id}
        
    # vector_store.similarity_search automatically handles 
    # embedding the 'query' string and performing the vector search
    return vector_store.similarity_search(query, k=top_k, filter=filter)

def get_document_chunks(doc_id: str, user_id: Optional[int] = None) -> List[dict]:
    """
    Retrieves all chunks belonging to a specific document ID.
    """
    try:
        filter_dict = {"doc_id": doc_id}
        if user_id:
            filter_dict["user_id"] = user_id

        results = vector_store.similarity_search(
            "", 
            k=500, # Increased k to get more chunks for large docs
            filter=filter_dict
        )
        
        chunks = [
            {
                "content": doc.page_content,
                "chunkIndex": i,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page", None),
            }
            for i, doc in enumerate(results)
        ]
        return chunks
    except Exception as e:
        print(f"Error fetching document chunks: {e}")
        return []

def list_documents_db(user_id: Optional[int] = None) -> List[dict]:
    """
    Retrieves a list of unique document names/sources currently stored 
    in the vector database, along with their chunk counts.
    """
    try:
        filter_dict = None
        if user_id:
            filter_dict = {"user_id": user_id}
            
        all_docs = vector_store.similarity_search("", k=100, filter=filter_dict) 
        
        # Group by doc_id and count chunks
        # Store source name associated with each doc_id
        doc_groups: dict[str, dict] = {}
        for doc in all_docs:
            d_id = doc.metadata.get("doc_id")
            if not d_id: continue
            
            if d_id not in doc_groups:
                doc_groups[d_id] = {
                    "name": doc.metadata.get("source", "Unknown Source"),
                    "count": 0
                }
            doc_groups[d_id]["count"] += 1
        
        # Build document objects matching frontend's DocumentSummary interface
        documents = [
            {"id": d_id, "name": info["name"], "chunkCount": info["count"]}
            for d_id, info in doc_groups.items()
        ]
        return documents
    except Exception as e:
        print(f"Error listing documents: {e}")
        return []