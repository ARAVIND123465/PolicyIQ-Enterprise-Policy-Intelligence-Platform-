import os
from fastapi import APIRouter
from app.config import get_settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """Return service health status and dependency checks."""
    settings = get_settings()

    # Check Google Gemini API Key
    has_api_key = bool(settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY.strip())

    # Check Handbook Document
    handbook_exists = os.path.exists(settings.HANDBOOK_JSON)

    # Check SQLite Database connectivity
    db_ok = True
    try:
        from app.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_ok = False

    all_healthy = has_api_key and handbook_exists and db_ok

    return {
        "status": "ok" if all_healthy else "degraded",
        "service": "policy-ai",
        "dependencies": {
            "ai_provider": "configured" if has_api_key else "missing_api_key",
            "handbook_source": "available" if handbook_exists else "missing_file",
            "database": "connected" if db_ok else "unreachable",
        },
    }
