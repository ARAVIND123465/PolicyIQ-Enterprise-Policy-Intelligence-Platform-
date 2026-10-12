"""
PolicyAI — Database Configuration
SQLite database with SQLAlchemy ORM.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

_BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/

# Use /tmp for writable SQLite database in serverless environments (e.g. Vercel, AWS Lambda)
is_serverless = bool(
    os.environ.get("VERCEL") or 
    os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or 
    os.environ.get("LAMBDA_TASK_ROOT")
)

if is_serverless:
    DB_PATH = Path("/tmp/policyai.db")
else:
    try:
        DB_PATH = _BACKEND_DIR / "data" / "policyai.db"
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    except OSError:
        DB_PATH = Path("/tmp/policyai.db")

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session, closes on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined by Base subclasses."""
    import app.models.employee  # noqa: F401
    Base.metadata.create_all(bind=engine)
