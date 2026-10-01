"""
PolicyAI — Chat Schemas
Request and response models for the chat API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class Source(BaseModel):
    """A source chunk cited in an answer."""
    source: str
    section: str
    part: Optional[str] = None
    record_id: Optional[str] = None


class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""
    message: str = Field(..., min_length=1, max_length=4096, description="User question")
    conversation_id: Optional[str] = Field(None, description="Conversation thread ID for history")
    top_k: Optional[int] = Field(4, ge=1, le=20, description="Number of sources to retrieve")


class ChatResponse(BaseModel):
    """Response returned to the frontend."""
    answer: str = Field(..., description="Generated answer")
    sources: list[Source] = Field(default_factory=list, description="Cited source chunks")
    conversation_id: Optional[str] = Field(None, description="Conversation thread ID")

