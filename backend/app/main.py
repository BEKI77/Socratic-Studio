from __future__ import annotations

import io
import re
from typing import Dict

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

from .store import add_document, list_documents, search_documents
from .text_utils import build_socratic_response


app = FastAPI(title="Socratic RAG Tutor API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str


LATEX_PATTERN = re.compile(r"\\(begin|end)\{[^}]+\}|\\[a-zA-Z]+|\$[^$]*\$")


def sanitize_latex(text: str) -> str:
    return " ".join(LATEX_PATTERN.sub(" ", text).split()).strip()


def extract_pdf_text(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


@app.get("/documents")
def get_documents() -> Dict[str, list]:
    return {"documents": list_documents()}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Upload a valid file.")

    name = file.filename
    extension = name.split(".")[-1].lower() if "." in name else ""
    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="Upload a valid file.")

    if extension == "pdf":
        text = extract_pdf_text(data)
    else:
        text = data.decode("utf-8", errors="ignore")

    if extension in {"tex", "latex"}:
        text = sanitize_latex(text)

    if not text.strip():
        raise HTTPException(status_code=422, detail="No extractable text found.")

    document = add_document(name=name, text=text)
    return {
        "id": document.id,
        "name": document.name,
        "chunkCount": len(document.chunks),
    }


@app.post("/chat")
def chat(request: ChatRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Ask a question to begin.")

    chunks = search_documents(question, top_k=4)
    if not chunks:
        return {
            "response": (
                "I don't have any documents yet. Upload lecture notes or textbooks so I can "
                "reason with them."
            ),
            "sources": [],
        }

    return build_socratic_response(question, chunks)
