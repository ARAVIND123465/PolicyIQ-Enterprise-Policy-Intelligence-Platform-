# PolicyAI — Enterprise Company Policy RAG Chatbot

An AI-powered chatbot that answers questions about your company's policies using Retrieval-Augmented Generation (RAG).

## Project Structure

```
policy-ai/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Python FastAPI
├── data/
│   ├── documents/     # Raw uploaded policy documents
│   ├── processed/     # Cleaned/chunked text (RAG output)
│   └── vectorstore/   # FAISS index (RAG output)
└── docker-compose.yml
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# → http://localhost:8000
```

### Docker
```bash
docker-compose up --build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router |
| Backend | Python, FastAPI, Uvicorn, Pydantic v2 |
| RAG | To be implemented (Gemini, FAISS, LangChain) |
| Icons | Lucide React |

## RAG Pipeline

The RAG pipeline is **not yet implemented**. Wire it up in:

- `backend/app/services/chat_service.py` → `handle_message()`
- `backend/app/rag/ingestion/` → Document loading and chunking
- `backend/app/rag/embeddings/` → Embedding generation
- `backend/app/rag/vectorstore/` → FAISS indexing
- `backend/app/rag/retrieval/` → Query rewriting and retrieval
- `backend/app/rag/generation/` → Prompt engineering and Gemini
- `backend/app/rag/evaluation/` → RAGAS evaluation

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Backend health check |
| POST | `/api/chat` | Send a message |
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/documents` | List documents |
| DELETE | `/api/documents/{id}` | Delete a document |
