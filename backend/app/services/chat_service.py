"""
PolicyAI — Chat Service
Wires the RAG pipeline into the chat API.

The vectorstore is built once (from the handbook JSON) on the first request
and cached in memory for all subsequent requests.
"""

import uuid
import os
import asyncio
from app.schemas.chat import ChatRequest, ChatResponse, Source
from app.config import get_settings
from app.rag.rag_pipeline import build_rag, ask_rag

settings = get_settings()

from datetime import datetime

# Module-level cache — built once, reused forever
_vectorstore = None
_conversations: dict[str, list[dict]] = {}


def _get_vectorstore():
    """Build and cache the FAISS vectorstore from the handbook JSON."""
    global _vectorstore
    if _vectorstore is None:
        json_path = settings.HANDBOOK_JSON
        if not os.path.exists(json_path):
            raise FileNotFoundError(
                f"Handbook JSON not found at: {json_path}\n"
                "Please place employee_handbook.json in data/documents/"
            )
        _vectorstore = build_rag(json_path)
    return _vectorstore


class ChatService:
    """Handles user questions by querying the RAG pipeline."""

    async def handle_message(self, request: ChatRequest) -> ChatResponse:
        """
        Process a user message through the RAG pipeline and return
        a grounded answer with cited policy sources.
        """
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # Load (or reuse cached) vectorstore
        vectorstore = _get_vectorstore()

        # Retrieve prior chat history for this conversation
        history = _conversations.get(conversation_id, [])

        # Run RAG in worker thread to prevent blocking FastAPI event loop
        result = await asyncio.to_thread(ask_rag, vectorstore, request.message, history)

        # Map RAG sources → schema
        sources = [
            Source(
                source=s.get("source", ""),
                section=s.get("section", ""),
                part=s.get("part"),
                record_id=s.get("record_id"),
            )
            for s in result.get("sources", [])
        ]

        # Record conversation turns
        now_iso = datetime.utcnow().isoformat() + "Z"
        if conversation_id not in _conversations:
            _conversations[conversation_id] = []

        _conversations[conversation_id].append({
            "id": f"u-{int(datetime.utcnow().timestamp()*1000)}",
            "role": "user",
            "content": request.message,
            "timestamp": now_iso,
        })
        _conversations[conversation_id].append({
            "id": f"a-{int(datetime.utcnow().timestamp()*1000)}",
            "role": "assistant",
            "content": result["answer"],
            "sources": [s.model_dump() for s in sources],
            "timestamp": now_iso,
        })

        return ChatResponse(
            answer=result["answer"],
            sources=sources,
            conversation_id=conversation_id,
        )

    def get_history(self) -> list[dict]:
        """Return list of conversation summaries."""
        summaries = []
        for cid, msgs in _conversations.items():
            if not msgs:
                continue
            first_user = next((m for m in msgs if m["role"] == "user"), None)
            title = first_user["content"][:45] if first_user else "Conversation"
            last_msg = msgs[-1]
            summaries.append({
                "id": cid,
                "title": title,
                "preview": last_msg["content"][:80],
                "timestamp": last_msg.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                "group": "Today",
            })
        # Sort newest first
        summaries.reverse()
        return summaries

    def get_conversation_messages(self, conversation_id: str) -> list[dict]:
        """Return all messages for a given conversation thread."""
        return _conversations.get(conversation_id, [])

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a conversation thread."""
        if conversation_id in _conversations:
            del _conversations[conversation_id]
            return True
        return False

