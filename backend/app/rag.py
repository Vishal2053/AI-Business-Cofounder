"""
Lightweight in-memory vector store fallback.

This avoids `langchain.vectorstores` / FAISS dependency and works cross-platform.
It uses simple token-overlap cosine similarity (stdlib only) to pick top-k documents.
"""
from typing import List
from collections import Counter
import math
import re


def _tokenize(text: str) -> List[str]:
    return re.findall(r"\w+", text.lower())


class _Doc:
    def __init__(self, text: str):
        self.text = text
        toks = _tokenize(text)
        self.count = Counter(toks)
        self.norm = math.sqrt(sum(v * v for v in self.count.values()))


# simple in-memory list of docs
_docs: List[_Doc] = []


def add_document(text: str):
    """Add a document to the in-memory store."""
    _docs.append(_Doc(text))


def _similarity(q_count: Counter, q_norm: float, doc: _Doc) -> float:
    # dot product
    dot = sum(q_count.get(k, 0) * v for k, v in doc.count.items())
    if q_norm == 0 or doc.norm == 0:
        return 0.0
    return dot / (q_norm * doc.norm)


def get_context(query: str, k: int = 4) -> str:
    """Return top-k documents concatenated as context for the query."""
    if not _docs:
        return "No business data uploaded yet."

    toks = _tokenize(query)
    q_count = Counter(toks)
    q_norm = math.sqrt(sum(v * v for v in q_count.values()))

    scored = [( _similarity(q_count, q_norm, d), d) for d in _docs]
    scored.sort(key=lambda t: t[0], reverse=True)

    top = [d.text for score, d in scored[:k] if score > 0]
    if not top:
        # fallback: return recent docs
        top = [d.text for d in _docs[-k:]]

    return "\n".join(top)

