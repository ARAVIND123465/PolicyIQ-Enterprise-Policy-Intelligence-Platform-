"""
PolicyAI — Vercel Serverless Function Entry Point

Exposes the FastAPI application instance for Vercel's modern Python runtime.
"""

import os
import sys

# Ensure backend root directory is on sys.path so 'app' package is discoverable
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.main import app  # noqa: E402
