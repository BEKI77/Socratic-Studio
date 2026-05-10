from typing import List, Set
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

def add_documents_to_db(chunks: List[Document]):
    """
    Takes a list of LangChain Document objects, 
    embeds them, and inserts them into PGVector.
    """
    try:
        # PGVector handles the embedding calculation and the SQL INSERT
        vector_store.add_documents(chunks)
        print(f"Successfully added {len(chunks)} chunks to PostgreSQL.")
    except Exception as e:
        print(f"Error adding documents to PGVector: {e}")
        raise

def search_documents_db(query: str, top_k: int = 4) -> List[Document]:
    """
    Queries the vector store for the most similar chunks.
    """
    # vector_store.similarity_search automatically handles 
    # embedding the 'query' string and performing the vector search
    return vector_store.similarity_search(query, k=top_k)

def get_document_chunks(source_name: str) -> List[dict]:
    """
    Retrieves all chunks belonging to a specific document source.
    """
    try:
        # Use a filter to search only within the specified source
        filter_doc = Document(
            page_content="",
            metadata={"source": source_name}
        )
        results = vector_store.similarity_search(
            "", 
            k=100,
            filter={"source": source_name}
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

def list_documents_db() -> List[dict]:
    """
    Retrieves a list of unique document names/sources currently stored 
    in the vector database, along with their chunk counts.
    """
    try:
        # We perform a broad search to find documents. 
        # Note: If you have thousands of docs, you might prefer a direct SQL query.
        all_docs = vector_store.similarity_search("", k=100) 
        
        # Group by source name and count chunks
        source_chunks: dict[str, int] = {}
        for doc in all_docs:
            source = doc.metadata.get("source", "Unknown Source")
            source_chunks[source] = source_chunks.get(source, 0) + 1
        
        # Build document objects matching frontend's DocumentSummary interface
        documents = [
            {"id": str(i), "name": name, "chunkCount": count}
            for i, (name, count) in enumerate(sorted(source_chunks.items()))
        ]
        return documents
    except Exception as e:
        print(f"Error listing documents: {e}")
        return []