import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

print(f"--- DEBUGGING CONFIG LOAD ---")
print(f"Absolute path of config.py: {Path(__file__).resolve()}")
print(f"BASE_DIR calculated as: {BASE_DIR}")
print(f"Checking for .env at: {os.path.join(BASE_DIR, '.env')}")
print(f"Does file exist? {os.path.isfile(os.path.join(BASE_DIR, '.env'))}")
print(f"-----------------------------")


class Settings(BaseSettings):
    # SQLite (for users/auth only — no Postgres needed)
    DATABASE_URL: str = "sqlite:///./socratic.db"

    # HuggingFace (for local embeddings)
    HF_TOKEN: str

    # Pinecone
    PINECONE_API_KEY: str
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "socratic-tutor"

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "mixtral-8x7b-32768"

    # Security
    SECRET_KEY: str = "secret"  # Use a secure key in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()