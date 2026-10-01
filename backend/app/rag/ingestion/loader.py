"""
ingestion/loader.py
Load the Employee Handbook JSON from disk.
"""

import json
from pathlib import Path


def load_json(file_path: str) -> dict:
    """Read and return a JSON file as a Python dict."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data
