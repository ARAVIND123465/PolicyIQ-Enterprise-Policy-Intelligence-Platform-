"""
PolicyAI — Documents API Router

POST   /api/documents/upload           Upload a policy document
GET    /api/documents                  List all uploaded documents
DELETE /api/documents/{document_id}    Remove a document

NOTE: Document processing and vector indexing NOT implemented here.
Implement those in the RAG ingestion pipeline.
"""

import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.document import DocumentResponse, DocumentListResponse, DocumentDeleteResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["Documents"])
document_service = DocumentService()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)) -> DocumentResponse:
    """
    Accept a file upload and store it.
    Document processing/indexing must be implemented in the RAG pipeline.
    """
    allowed_types = {
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/json",
        "text/json",
        "application/octet-stream",
    }
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = {".pdf", ".txt", ".doc", ".docx", ".json"}

    if ext not in allowed_exts and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.filename}. Allowed formats: PDF, TXT, DOC, DOCX, JSON",
        )

    try:
        result = await document_service.save_document(file)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("", response_model=DocumentListResponse)
async def list_documents() -> DocumentListResponse:
    """Return all documents that have been uploaded."""
    try:
        return await document_service.list_documents()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
async def delete_document(document_id: str) -> DocumentDeleteResponse:
    """Delete a document by ID."""
    try:
        return await document_service.delete_document(document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
