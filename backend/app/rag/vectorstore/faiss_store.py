"""
vectorstore/faiss_store.py
Build and persist a FAISS vectorstore from pre-chunked documents.
"""

from langchain_community.vectorstores import FAISS
from app.rag.embeddings.embedding_model import get_embeddings


def create_vectorstore(documents: list[dict]) -> FAISS:
    """
    Embed all document chunks and store them in an in-memory FAISS index.

    Args:
        documents: List of dicts with keys 'text', 'section', 'source', etc.

    Returns:
        A FAISS vectorstore instance ready for retrieval.
    """
    texts = [doc["text"] for doc in documents]

    metadatas = [
        {
            "section": doc.get("section", ""),
            "part": doc.get("part", ""),
            "record_id": doc.get("record_id", ""),
            "source": doc.get("source", ""),
        }
        for doc in documents
    ]

    embeddings = get_embeddings()

    vectorstore = FAISS.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
    )

    return vectorstore


def save_vectorstore(vectorstore: FAISS, path: str) -> None:
    """Persist the FAISS index to disk."""
    vectorstore.save_local(path)


def load_vectorstore(path: str) -> FAISS:
    """Load a previously persisted FAISS index from disk."""
    embeddings = get_embeddings()
    return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
