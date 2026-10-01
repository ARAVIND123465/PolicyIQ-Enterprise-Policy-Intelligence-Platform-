"""
rag_pipeline.py
High-level RAG pipeline: build a vectorstore from a JSON document
and answer questions against it.
"""

import os
import re
from app.rag.ingestion.loader import load_json
from app.rag.ingestion.splitter import split_documents
from app.rag.vectorstore.faiss_store import create_vectorstore, save_vectorstore, load_vectorstore
from app.rag.retrieval.retriever import get_relevant_documents
from app.rag.generation.generator import (
    generate_answer,
    _GREETING_PATTERNS,
    _PROMOTION_KEYWORDS,
)
from app.config import get_settings


def build_rag(json_path: str):
    """
    Load the handbook JSON, chunk it, embed the chunks, and return
    a ready-to-query FAISS vectorstore. Persists index to disk for instant loading.

    Args:
        json_path: Absolute or relative path to the handbook JSON file.

    Returns:
        A populated FAISS vectorstore instance.
    """
    settings = get_settings()
    store_dir = settings.VECTORSTORE_DIR
    index_file = os.path.join(store_dir, "index.faiss")

    # If index already exists on disk, load immediately in <100ms
    if os.path.exists(index_file):
        try:
            return load_vectorstore(store_dir)
        except Exception:
            pass

    # Otherwise build from documents and save to disk
    data = load_json(json_path)
    documents = split_documents(data)
    vectorstore = create_vectorstore(documents)
    try:
        save_vectorstore(vectorstore, store_dir)
    except Exception:
        pass

    return vectorstore



def ask_rag(vectorstore, question: str, chat_history: list = None) -> dict:
    """
    Query the vectorstore and generate a grounded answer.

    Args:
        vectorstore:   A FAISS vectorstore built by build_rag().
        question:      The user's natural-language question.
        chat_history:  Optional list of prior turn dicts [{"role": "user"|"assistant", "content": "..."}]

    Returns:
        dict with keys 'answer' and 'sources'
    """
    cleaned = re.sub(r"[^\w\s]", "", question.strip().lower())

    # Fast-path for greetings and promotion questions (saves embedding quota and responds instantly)
    if cleaned in _GREETING_PATTERNS or any(k in cleaned for k in _PROMOTION_KEYWORDS):
        answer = generate_answer(question, [], chat_history)
        return {
            "answer": answer,
            "sources": [],
        }

    # Context-aware retrieval for follow-up questions
    retrieval_query = question
    if chat_history and len(question.split()) < 8:
        last_user_query = next(
            (m["content"] for m in reversed(chat_history) if m.get("role") == "user"),
            "",
        )
        if last_user_query:
            retrieval_query = f"{question} {last_user_query}"

    documents = get_relevant_documents(vectorstore, retrieval_query)
    answer = generate_answer(question, documents, chat_history)

    # If the answer is out-of-scope or information not found, do not attach sources
    no_source_indicators = [
        "could not find",
        "cannot find",
        "not found in the company policy",
        "not mentioned in the policy",
        "not found in the provided",
        "not present in the context",
        "not related to company policies",
        "how can i help you with our company policies",
        "i am your policyai assistant",
        "i am here to help you with company workplace policies",
        "career progression",
        "case for promotion",
        "steps to secure a promotion",
        "promotion roadmap",
        "performance-driven",
    ]
    should_omit_sources = any(phrase in answer.lower() for phrase in no_source_indicators)

    if should_omit_sources:
        sources = []
    else:
        sources = [
            {
                "source": doc.metadata.get("source"),
                "section": doc.metadata.get("section"),
                "part": doc.metadata.get("part"),
                "record_id": doc.metadata.get("record_id"),
            }
            for doc in documents
        ]

    return {
        "answer": answer,
        "sources": sources,
    }
