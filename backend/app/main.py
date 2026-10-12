"""
PolicyAI — FastAPI Application Entry Point

Starts the PolicyAI backend server with CORS middleware and all API routers.
Run with:  uvicorn app.main:app --reload
"""

from typing import Optional
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import health, chat, documents, hr, employee
from app.database import init_db, SessionLocal
from app.services.employee_service import EmployeeService

settings = get_settings()

# ── Application Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "PolicyAI — Enterprise Company Policy RAG Chatbot & Employee Intelligence Platform. "
        "Ask questions about your company's policies and receive "
        "cited, AI-generated answers, plus HR and Employee directory management."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Initialize database schema and seed sample employees on startup
@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        EmployeeService().seed_sample_employees(db)
    finally:
        db.close()

# ── CORS Middleware ───────────────────────────────────────────────────────────
origins = [
    "https://policy-iq-enterprise-policy-intelli.vercel.app",
    "https://policy-iq-enterprise-policy-intelli-three.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(hr.router)
app.include_router(employee.router)


# ── /chat and /ask Aliases ────────────────────────────────────────────────────
@app.post("/chat", response_model=chat.ChatResponse, tags=["Chat"])
@app.post("/ask", response_model=chat.ChatResponse, tags=["Chat"])
async def chat_alias(
    request: chat.ChatRequest,
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
) -> chat.ChatResponse:
    """Convenience alias for /api/chat accepting both 'question' and 'message'."""
    return await chat.send_message(request, x_user_role=x_user_role)


# ── Root Redirect ─────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
