from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chats, documents
from app.db.session import engine
from sqlalchemy import text
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup logic ---
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Successfully connected to PostgreSQL!")
    except Exception as e:
        print(f"Connection failed: {e}")
        # Optionally, you can raise the error to prevent the app from starting:
        # raise e
    
    yield
    
    # --- Shutdown logic ---
    # Close your engine or database pool here if necessary
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
