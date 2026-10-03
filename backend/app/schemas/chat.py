"""
PolicyAI — Chat Schemas
Request and response models for the chat API.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any


class Source(BaseModel):
    """A source chunk cited in an answer."""
    source: str
    section: str
    part: Optional[str] = None
    record_id: Optional[str] = None


class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""
    message: Optional[str] = Field(None, max_length=4096, description="User question")
    question: Optional[str] = Field(None, max_length=4096, description="Alias for message")
    conversation_id: Optional[str] = Field(None, description="Conversation thread ID for history")
    top_k: Optional[int] = Field(4, ge=1, le=20, description="Number of sources to retrieve")

    @model_validator(mode="before")
    @classmethod
    def validate_message_or_question(cls, data: Any) -> Any:
        if isinstance(data, dict):
            msg = data.get("message") or data.get("question")
            if not msg or not str(msg).strip():
                raise ValueError("Field 'message' or 'question' is required.")
            data["message"] = str(msg).strip()
        return data


class ChatResponse(BaseModel):
    """Response returned to the frontend."""
    answer: str = Field(..., description="Generated answer")
    sources: list[Source] = Field(default_factory=list, description="Cited source chunks")
    conversation_id: Optional[str] = Field(None, description="Conversation thread ID")

