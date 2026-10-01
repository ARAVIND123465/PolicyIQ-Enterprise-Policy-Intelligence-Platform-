"""
PolicyAI — Chat API Router
POST /api/chat

NOTE: RAG pipeline not yet implemented.
Replace the placeholder logic inside ChatService with your implementation.
"""

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["Chat"])
chat_service = ChatService()


@router.post("", response_model=ChatResponse)
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    Accept a user question and return an AI-generated answer with sources.
    The RAG pipeline is invoked inside ChatService.
    """
    try:
        response = await chat_service.handle_message(request)
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/history")
async def list_history() -> list[dict]:
    """Return all conversation thread summaries."""
    return chat_service.get_history()


@router.get("/history/{conversation_id}")
async def get_conversation(conversation_id: str) -> dict:
    """Return all messages for a specific conversation thread."""
    messages = chat_service.get_conversation_messages(conversation_id)
    return {
        "conversation_id": conversation_id,
        "messages": messages,
    }


@router.delete("/history/{conversation_id}")
async def delete_conversation(conversation_id: str) -> dict:
    """Delete a conversation thread."""
    deleted = chat_service.clear_conversation(conversation_id)
    return {"deleted": deleted}
