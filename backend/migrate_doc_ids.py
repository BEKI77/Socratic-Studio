import uuid
from sqlalchemy import text
from app.db.session import engine, SessionLocal
from app.rag.vector_store import COLLECTION_NAME

def migrate_existing_documents():
    """
    Migrates existing documents in the PGVector store to use unique UUIDs.
    Assigns a unique UUID to each unique source/user combination.
    """
    print(f"Starting migration for collection: {COLLECTION_NAME}")
    
    db = SessionLocal()
    try:
        # 1. Get all unique combinations of source and user_id that DON'T have a doc_id yet
        # We access the metadata column which is JSONB in our PGVector setup
        query = text(f"""
            SELECT DISTINCT 
                c.metadata->>'source' as source, 
                c.metadata->>'user_id' as user_id
            FROM langchain_pg_embedding c
            JOIN langchain_pg_collection col ON c.collection_id = col.uuid
            WHERE col.name = :collection_name
            AND (c.metadata->>'doc_id' IS NULL)
        """)
        
        results = db.execute(query, {"collection_name": COLLECTION_NAME}).fetchall()
        
        if not results:
            print("No documents found needing migration.")
            return

        print(f"Found {len(results)} unique documents to migrate.")

        for row in results:
            source = row.source
            user_id = row.user_id
            
            if not source:
                continue
                
            new_uuid = str(uuid.uuid4())
            print(f"Migrating: Source='{source}', User='{user_id}' -> New ID: {new_uuid}")
            
            # 2. Update all chunks matching this source and user_id
            # We use the JSONB concatenation operator (||) to add the doc_id to the metadata
            update_query = text(f"""
                UPDATE langchain_pg_embedding
                SET metadata = metadata || :new_metadata
                WHERE collection_id = (SELECT uuid FROM langchain_pg_collection WHERE name = :collection_name LIMIT 1)
                AND metadata->>'source' = :source
                AND (
                    (:user_id IS NULL AND metadata->>'user_id' IS NULL) 
                    OR (metadata->>'user_id' = :user_id)
                )
            """)
            
            db.execute(update_query, {
                "new_metadata": f'{{"doc_id": "{new_uuid}"}}',
                "collection_name": COLLECTION_NAME,
                "source": source,
                "user_id": user_id
            })
            
        db.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_existing_documents()
