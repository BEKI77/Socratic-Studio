from typing import List
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
import os

# 1. Initialize the embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Configure the connection
CONNECTION_STRING = os.getenv("DATABASE_URL")
COLLECTION_NAME = "socratic_tutor_collection"

# 3. Create the vector store interface
vector_store = PGVector(
    embeddings=embeddings,
    connection=str(CONNECTION_STRING),
    collection_name=COLLECTION_NAME,
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