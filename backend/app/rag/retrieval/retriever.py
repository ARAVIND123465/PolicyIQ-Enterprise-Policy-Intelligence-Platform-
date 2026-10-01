"""
retrieval/retriever.py
Retrieve the top-k most relevant document chunks from the vectorstore.
Includes error handling for rate limits and connection issues.
"""

import logging
from langchain_community.vectorstores import FAISS

logger = logging.getLogger(__name__)


def get_relevant_documents(vectorstore: FAISS, question: str, k: int = 4) -> list:
    """
    Return the top-k chunks most semantically similar to the question.

    Args:
        vectorstore: A loaded FAISS vectorstore.
        question:    The user's natural-language query.
        k:           Number of chunks to retrieve (default 4).

    Returns:
        List of LangChain Document objects with .page_content and .metadata.
    """
    if vectorstore is None:
        return []

    try:
        retriever = vectorstore.as_retriever(
            search_kwargs={"k": k}
        )
        return retriever.invoke(question)
    except Exception as exc:
        logger.warning(f"Error retrieving documents for '{question}': {exc}")
        return []
