from __future__ import annotations

from dataclasses import dataclass
from typing import List
from uuid import uuid4

from .text_utils import ChunkRecord, chunk_text, cosine_similarity, tokenize, vectorize


@dataclass
class StoredDocument:
    id: str
    name: str
    text: str
    chunks: List[ChunkRecord]


def _create_chunk_record(document_id: str, document_name: str, text: str) -> ChunkRecord:
    tokens = tokenize(text)
    return ChunkRecord(
        id=f"{document_id}-{uuid4().hex[:6]}",
        document_id=document_id,
        document_name=document_name,
        text=text,
        vector=vectorize(tokens),
    )


def list_documents():
    return [
        {
            "id": doc.id,
            "name": doc.name,
            "chunkCount": len(doc.chunks),
        }
        for doc in _DOCUMENTS
    ]


def add_document(name: str, text: str) -> StoredDocument:
    document_id = f"doc-{uuid4().hex[:8]}"
    chunks = [
        _create_chunk_record(document_id=document_id, document_name=name, text=chunk)
        for chunk in chunk_text(text)
    ]
    document = StoredDocument(id=document_id, name=name, text=text, chunks=chunks)
    _DOCUMENTS.append(document)
    return document


def search_documents(query: str, top_k: int = 4) -> List[ChunkRecord]:
    query_vector = vectorize(tokenize(query))
    scored = [
        (chunk, cosine_similarity(query_vector, chunk.vector))
        for document in _DOCUMENTS
        for chunk in document.chunks
    ]

    return [
        chunk
        for chunk, _score in sorted(scored, key=lambda entry: entry[1], reverse=True)[:top_k]
    ]


