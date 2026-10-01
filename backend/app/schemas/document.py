"""
PolicyAI — Document Schemas
Request and response models for the documents API.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DocumentResponse(BaseModel):
    """Metadata for an uploaded document."""
    document_id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str = Field(default="pending", description="pending | processing | indexed | failed")
    uploaded_at: datetime
    indexed_at: Optional[datetime] = None


class DocumentListResponse(BaseModel):
    """List of uploaded documents."""
    documents: list[DocumentResponse]
    total: int


class DocumentDeleteResponse(BaseModel):
    """Confirmation of document deletion."""
    document_id: str
    deleted: bool
    message: str
