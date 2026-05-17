from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chats, documents
from app.db.session import engine
from sqlalchemy import text
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # SQLite connection check (no Docker/Postgres needed)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("SQLite connected successfully.")
    except Exception as e:
        print(f"SQLite connection failed: {e}")
    yield
    engine.dispose()
    print("Database connection closed.")

app = FastAPI(title="Socratic RAG Tutor API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chats.router, prefix="/api/v1", tags=["Chat"])
app.include_router(documents.router, prefix="/api/v1", tags=["Documents"])

@app.get("/")
def root():
    return {"message": "Server is running! Go to /docs for Swagger."}

# ── Health check: confirms Pinecone + Groq are reachable ──────────────────────
@app.get("/health")
async def health_check():
    from pinecone import Pinecone
    from app.core.config import settings
    from groq import AsyncGroq

    # Pinecone
    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        idx = pc.Index(settings.PINECONE_INDEX_NAME)
        stats = idx.describe_index_stats()
        pinecone_status = {"status": "ok", "vectors": stats.total_vector_count}
    except Exception as e:
        pinecone_status = {"status": "error", "detail": str(e)}

    # Groq
    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        resp = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": "say ok"}],
            max_tokens=5,
        )
        groq_status = {"status": "ok", "reply": resp.choices[0].message.content}
    except Exception as e:
        groq_status = {"status": "error", "detail": str(e)}

    return {"pinecone": pinecone_status, "groq": groq_status}