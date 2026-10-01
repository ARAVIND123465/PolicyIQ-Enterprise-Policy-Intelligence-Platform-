"""
PolicyAI — Document Service (Skeleton)

Handles file I/O for uploaded documents.
Document processing / vector indexing must be implemented
in the RAG ingestion pipeline (backend/app/rag/ingestion/).
"""

import uuid
import os
from datetime import datetime
from fastapi import UploadFile
from app.config import get_settings
from app.schemas.document import DocumentResponse, DocumentListResponse, DocumentDeleteResponse

settings = get_settings()

# In-memory registry — pre-seeded with indexed company documents
_document_registry: dict[str, DocumentResponse] = {}


def _init_default_documents():
    global _document_registry
    if not _document_registry:
        handbook_path = settings.HANDBOOK_JSON
        if os.path.exists(handbook_path):
            size = os.path.getsize(handbook_path)
            mtime = datetime.fromtimestamp(os.path.getmtime(handbook_path))
            _document_registry["default-handbook"] = DocumentResponse(
                document_id="default-handbook",
                filename="employee_handbook.json",
                file_type="application/json",
                size_bytes=size,
                status="indexed",
                uploaded_at=mtime,
            )

_init_default_documents()


class DocumentService:
    """
    Manages document file storage and metadata.

    TODO (RAG developer): Replace in-memory registry with a database.
    Wire document indexing into the RAG ingestion pipeline after upload.
    """

    async def save_document(self, file: UploadFile) -> DocumentResponse:
        """
        Persist the uploaded file to disk and register its metadata.

        Args:
            file: Uploaded file from the API layer.

        Returns:
            DocumentResponse with assigned document_id and metadata.
        """
        document_id = str(uuid.uuid4())
        contents = await file.read()

        # Ensure upload directory exists
        upload_dir = os.path.abspath(settings.DOCUMENTS_DIR)
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, f"{document_id}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(contents)

        doc = DocumentResponse(
            document_id=document_id,
            filename=file.filename or "unknown",
            file_type=file.content_type or "unknown",
            size_bytes=len(contents),
            status="pending",  # will become "indexed" after RAG pipeline runs
            uploaded_at=datetime.utcnow(),
        )
        _document_registry[document_id] = doc
        return doc

    async def list_documents(self) -> DocumentListResponse:
        """Return all registered documents."""
        docs = list(_document_registry.values())
        return DocumentListResponse(documents=docs, total=len(docs))

    async def delete_document(self, document_id: str) -> DocumentDeleteResponse:
        """Remove a document from the registry and disk."""
        if document_id not in _document_registry:
            raise ValueError(f"Document '{document_id}' not found.")

        _document_registry.pop(document_id)

        return DocumentDeleteResponse(
            document_id=document_id,
            deleted=True,
            message=f"Document {document_id} deleted successfully.",
        )
