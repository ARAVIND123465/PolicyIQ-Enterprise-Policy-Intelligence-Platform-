"""
PolicyAI — Health Check Router
GET /health  →  { "status": "ok", "service": "policy-ai" }
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """Return service health status."""
    return {
        "status": "ok",
        "service": "policy-ai",
    }
