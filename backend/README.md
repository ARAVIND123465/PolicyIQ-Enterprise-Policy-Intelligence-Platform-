# PolicyAI Backend

FastAPI backend skeleton for the PolicyAI enterprise policy chatbot.

## Stack
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115 |
| Runtime | Python 3.11+ |
| Validation | Pydantic v2 |
| Server | Uvicorn |
| Config | pydantic-settings + python-dotenv |
| Testing | pytest + httpx |

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in GEMINI_API_KEY when ready

# 4. Start the development server
uvicorn app.main:app --reload
```

Server runs at **http://localhost:8000**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc |
| POST | `/api/chat` | Send a message (RAG placeholder) |
| POST | `/api/documents/upload` | Upload a policy document |
| GET | `/api/documents` | List all documents |
| DELETE | `/api/documents/{id}` | Delete a document |

## Project Structure

```
app/
├── main.py           # FastAPI app factory + routers
├── config.py         # Settings from environment
├── api/
│   ├── health.py     # GET /health
│   ├── chat.py       # POST /api/chat
│   └── documents.py  # Document CRUD
├── schemas/
│   ├── chat.py       # ChatRequest / ChatResponse / Source
│   └── document.py   # DocumentResponse / etc.
├── services/
│   ├── chat_service.py      # ← Wire RAG pipeline here
│   └── document_service.py  # File I/O + metadata registry
└── rag/              # RAG pipeline — implement here
    ├── ingestion/
    ├── embeddings/
    ├── vectorstore/
    ├── retrieval/
    ├── generation/
    └── evaluation/
```

## RAG Implementation Guide

The RAG pipeline is intentionally **not implemented**. Wire it up in:

- **`app/services/chat_service.py`** → `handle_message()` method
- **`app/rag/ingestion/`** → Document loading, cleaning, chunking
- **`app/rag/embeddings/`** → Embedding generation
- **`app/rag/vectorstore/`** → FAISS indexing
- **`app/rag/retrieval/`** → Query rewriting, retrieval, re-ranking
- **`app/rag/generation/`** → Prompt engineering, Gemini integration
- **`app/rag/evaluation/`** → Retrieval and answer quality evaluation

## Running Tests

```bash
pytest tests/ -v
```
