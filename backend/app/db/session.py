from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# The engine uses your .env DATABASE_URL
engine = create_engine(settings.DATABASE_URL)

# This session factory is what you'll use to interact with the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)