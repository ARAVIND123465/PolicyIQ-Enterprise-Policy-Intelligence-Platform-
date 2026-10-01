"""
embeddings/embedding_model.py
Initialise the Google Generative AI embeddings model.
"""

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import get_settings


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Return a configured Gemini embedding model instance."""
    settings = get_settings()
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2-preview",
        google_api_key=settings.GOOGLE_API_KEY,
    )

