from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings

pc = Pinecone(api_key=settings.PINECONE_API_KEY)

# Check if index already exists before creating
existing = [i.name for i in pc.list_indexes()]
if settings.PINECONE_INDEX_NAME in existing:
    print(f"Index '{settings.PINECONE_INDEX_NAME}' already exists. Nothing to do.")
else:
    pc.create_index(
        name=settings.PINECONE_INDEX_NAME,
        dimension=384,      # must match all-MiniLM-L6-v2
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    print(f"Index '{settings.PINECONE_INDEX_NAME}' created successfully.")