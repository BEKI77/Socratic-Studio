from sqlalchemy import text
from app.db.session import engine, SessionLocal
from app.models.user import Base
import sys

def reset_database():
    """
    Completely resets the database by dropping all tables and recreating them.
    Also clears the PGVector collections and embeddings.
    """
    print("WARNING: This will delete ALL data including users, chats, and documents.")
    confirm = input("Are you sure you want to proceed? (y/N): ")
    if confirm.lower() != 'y':
        print("Reset aborted.")
        return

    db = SessionLocal()
    try:
        # 1. Drop vector store tables if they exist
        print("Cleaning up PGVector tables...")
        db.execute(text("DROP TABLE IF EXISTS langchain_pg_embedding CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS langchain_pg_collection CASCADE;"))
        
        # 2. Drop all other tables managed by SQLAlchemy
        print("Dropping all application tables...")
        Base.metadata.drop_all(bind=engine)
        
        # 3. Recreate all tables
        print("Recreating application tables...")
        Base.metadata.create_all(bind=engine)
        
        db.commit()
        print("\nDatabase has been reset successfully.")
        print("You can now start the application and register a fresh user.")

    except Exception as e:
        print(f"\nError resetting database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
