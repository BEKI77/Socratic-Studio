# Socratic Model Backend

## Structure

This is the file structure of the backend.

```text
backend/
├── app/
│   ├── api/                # API route handlers
│   │   └── routes/
│   │       ├── documents.py # /documents, /upload endpoints
│   │       └── chat.py      # /chat endpoint
│   ├── core/               # Configuration and global settings
│   │   └── config.py        # Settings (DATABASE_URL, etc.)
│   ├── db/                 # Database connection logic
│   │   └── session.py       # SQLAlchemy engine and session management
│   ├── models/             # Pydantic schemas and DB models
│   ├── rag/                # RAG pipeline logic
│   │   ├── ingestion.py     # Document processing, chunking, and storage
│   │   ├── vector_store.py  # PGVector integration
│   │   └── document_loader.py # Logic to load PDFs/LaTeX
│   └── main.py             # App entry point (FastAPI initialization)
├── db/                     # Database infrastructure
│   └── init.sql            # Script for enabling the pgvector extension
├── .env                    # Environment variables (DB credentials)
├── docker-compose.yml      # Docker container definitions
└── requirements.txt        # Project dependencies
```

## How to run on local machine
