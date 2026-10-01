"""
PolicyAI — Application Configuration
Loads settings from environment variables / .env file.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

# Resolve the repo root  (config.py lives at backend/app/config.py)
_BACKEND_DIR = Path(__file__).resolve().parent.parent   # backend/
_REPO_ROOT = _BACKEND_DIR.parent                        # policy-ai/


class Settings(BaseSettings):
    # ── Application ─────────────────────────────────────────────────────────
    APP_NAME: str = "PolicyAI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

    # ── Google / Gemini API key ───────────────────────────────────────────────
    # The Google SDK reads GOOGLE_API_KEY from the environment automatically.
    # Set this in your .env file.
    GOOGLE_API_KEY: str = ""

    # ── Data Paths (absolute) ─────────────────────────────────────────────────
    DOCUMENTS_DIR: str = str(_REPO_ROOT / "data" / "documents")
    PROCESSED_DIR: str = str(_REPO_ROOT / "data" / "processed")
    VECTORSTORE_DIR: str = str(_REPO_ROOT / "data" / "vectorstore")

    # ── Handbook JSON (default source document) ───────────────────────────────
    HANDBOOK_JSON: str = str(_REPO_ROOT / "data" / "documents" / "employee_handbook.json")

    # ── RAG Tuning ───────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    TOP_K_RESULTS: int = 4

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()

