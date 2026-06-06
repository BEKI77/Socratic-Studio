import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

print(f"--- DEBUGGING CONFIG LOAD ---")
print(f"Absolute path of config.py: {Path(__file__).resolve()}")
print(f"BASE_DIR calculated as: {BASE_DIR}")
print(f"Checking for .env at: {os.path.join(BASE_DIR, '.env')}")
print(f"Does file exist? {os.path.isfile(os.path.join(BASE_DIR, '.env'))}")
print(f"-----------------------------")

class Settings(BaseSettings):
    DATABASE_URL: str
    HF_TOKEN: str
    model_api_url: str
    
    SECRET_KEY: str = "secret" # Use a secure key in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding='utf-8',
        extra="ignore"
    )

settings = Settings()