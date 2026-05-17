from typing import List, Optional
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from app.core.config import settings

# 1. Initialize the embedding model (still local/HuggingFace — free, no change needed)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Initialize Pinecone client and connect to your index
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

# 3. Create the LangChain vector store wrapper around the Pinecone index
vector_store = PineconeVectorStore(
    index=index,
    embedding=embeddings,
    text_key="text",  # The metadata key where the raw chunk text is stored
)


def add_documents_to_db(chunks: List[Document], user_id: Optional[int] = None):
    """
    Takes a list of LangChain Document objects,
    embeds them, and upserts them into Pinecone.
    """
    if user_id:
        for chunk in chunks:
            chunk.metadata["user_id"] = str(user_id)  # Pinecone metadata must be strings/numbers
    try:
        vector_store.add_documents(chunks)
        print(f"Successfully added {len(chunks)} chunks to Pinecone.")
    except Exception as e:
        print(f"Error adding documents to Pinecone: {e}")
        raise


def search_documents_db(query: str, top_k: int = 4, user_id: Optional[int] = None) -> List[Document]:
    """
    Queries Pinecone for the most similar chunks to the query.
    Optionally filters by user_id.
    """
    filter_dict = None
    if user_id:
        filter_dict = {"user_id": {"$eq": str(user_id)}}

    return vector_store.similarity_search(query, k=top_k, filter=filter_dict)


def get_document_chunks(doc_id: str, user_id: Optional[int] = None) -> List[dict]:
    """
    Retrieves all chunks belonging to a specific document ID.
    Uses Pinecone metadata filtering.
    """
    try:
        filter_dict: dict = {"doc_id": {"$eq": doc_id}}
        if user_id:
            filter_dict["user_id"] = {"$eq": str(user_id)}

        # Pinecone doesn't support empty-string queries well,
        # so we use a dummy query and rely on the metadata filter.
        results = vector_store.similarity_search(
            "document content",
            k=500,
            filter=filter_dict,
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
    Retrieves unique documents stored in Pinecone for the given user,
    along with their chunk counts.
    """
    try:
        # Query Pinecone index stats first to ensure index has vectors
        stats = index.describe_index_stats()

        # Normalize stats access (could be dict or object depending on client)
        total_vectors = None
        namespaces = None
        try:
            if isinstance(stats, dict):
                total_vectors = stats.get("total_vector_count")
                namespaces = stats.get("namespaces")
            else:
                total_vectors = getattr(stats, "total_vector_count", None)
                namespaces = getattr(stats, "namespaces", None)
        except Exception:
            total_vectors = None
            namespaces = None

        if total_vectors == 0 or (isinstance(namespaces, dict) and len(namespaces) == 0):
            return []

        filter_dict = None
        if user_id:
            filter_dict = {"user_id": {"$eq": str(user_id)}}

        # Use a very broad/common query to retrieve many vectors
        results = vector_store.similarity_search(
            "the",
            k=200,
            filter=filter_dict,
        )

        print(f"DEBUG list_documents_db: got {len(results)} results from Pinecone")
        for r in results[:3]:
            try:
                print(f"DEBUG metadata: {r.metadata}")
            except Exception:
                pass

        doc_groups: dict[str, dict] = {}
        for doc in results:
            d_id = doc.metadata.get("doc_id") or doc.metadata.get("source")
            if not d_id:
                continue
            if d_id not in doc_groups:
                doc_groups[d_id] = {
                    "name": doc.metadata.get("source", doc.metadata.get("filename", "Unknown")),
                    "count": 0,
                }
            doc_groups[d_id]["count"] += 1

        return [
            {"id": d_id, "name": info["name"], "chunkCount": info["count"]}
            for d_id, info in doc_groups.items()
        ]
    except Exception as e:
        print(f"Error listing documents: {e}")
        return []