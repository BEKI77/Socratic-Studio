from __future__ import annotations

import math
import random
import re
from dataclasses import dataclass
from typing import Dict, Iterable, List


@dataclass(frozen=True)
class ChunkRecord:
    id: str
    document_id: str
    document_name: str
    text: str
    vector: Dict[str, int]


@dataclass(frozen=True)
class SocraticResponseSource:
    id: str
    document_id: str
    document_name: str
    preview: str


STOP_WORDS = {
    "the",
    "and",
    "for",
    "that",
    "with",
    "from",
    "this",
    "there",
    "into",
    "about",
    "your",
    "you",
    "are",
    "was",
    "were",
    "has",
    "have",
    "had",
    "can",
    "will",
    "should",
    "could",
    "would",
    "what",
    "when",
    "where",
    "which",
    "while",
    "been",
    "their",
    "they",
    "them",
    "then",
    "than",
    "also",
    "such",
    "using",
    "use",
    "used",
    "but",
    "not",
    "only",
    "does",
    "did",
    "how",
}

WORD_REGEX = re.compile(r"[a-zA-Z0-9]+")


def chunk_text(text: str, max_length: int = 900, overlap: int = 120) -> List[str]:
    if not text:
        return []

    normalized = " ".join(text.split()).strip()
    if not normalized:
        return []

    safe_overlap = min(overlap, max(max_length - 1, 0))
    chunks: List[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + max_length, len(normalized))
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = max(end - safe_overlap, 0)
    return chunks


def tokenize(text: str) -> List[str]:
    if not text:
        return []
    matches = WORD_REGEX.findall(text.lower())
    return [token for token in matches if len(token) > 2 and token not in STOP_WORDS]


def vectorize(tokens: Iterable[str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    return counts


def cosine_similarity(vector_a: Dict[str, int], vector_b: Dict[str, int]) -> float:
    if not vector_a or not vector_b:
        return 0.0

    dot = 0.0
    norm_a = 0.0
    norm_b = 0.0

    for key, value in vector_a.items():
        norm_a += value * value
        other_value = vector_b.get(key)
        if other_value is not None:
            dot += value * other_value

    for value in vector_b.values():
        norm_b += value * value

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (math.sqrt(norm_a) * math.sqrt(norm_b))


def build_socratic_response(question: str, chunks: List[ChunkRecord]):
    excerpt = "\n\n".join(
        f"({index + 1}) {chunk.text}" for index, chunk in enumerate(chunks)
    )

    guiding_prompts = [
        "What core principle or definition might be relevant here?",
        "Which assumptions are you making that we can test?",
        "How would you explain this concept to a peer in one paragraph?",
        "What is the first small step you could solve before the full problem?",
    ]

    question_prompt = random.choice(guiding_prompts)

    return {
        "response": (
            "Let's reason it out together.\n\n"
            "Here are the most relevant notes I found:\n"
            f"{excerpt}\n\n"
            "Instead of jumping to the final answer, try this:\n"
            "- Summarize the key idea from excerpt (1) in your own words.\n"
            f"- Connect that idea to the question: \"{question}\"\n"
            "- Identify any formula, definition, or rule that anchors your reasoning.\n\n"
            f"{question_prompt}"
        ),
        "sources": [
            SocraticResponseSource(
                id=chunk.id,
                document_id=chunk.document_id,
                document_name=chunk.document_name,
                preview=chunk.text[:180],
            ).__dict__
            for chunk in chunks
        ],
    }
