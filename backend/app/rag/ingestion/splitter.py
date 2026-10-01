"""
ingestion/splitter.py
Split handbook records into overlapping text chunks for embedding.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(data: dict) -> list[dict]:
    """
    Iterate over every record in the handbook JSON and split each
    record's content into overlapping chunks.

    Expected JSON shape:
        {
            "metadata": { "title": "...", ... },
            "records": [
                {
                    "id": "II.A",
                    "part": "...",
                    "section": "A",
                    "title": "...",
                    "content": "...",
                    "legal_notes": [...]
                },
                ...
            ]
        }
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
    )

    documents: list[dict] = []
    records = data.get("records", [])
    source_title = data.get("metadata", {}).get("title", "Unknown Source")

    for record in records:
        content = record.get("content", "")
        if not content:
            continue

        chunks = splitter.split_text(content)

        for chunk in chunks:
            documents.append(
                {
                    "text": chunk,
                    "section": record.get("title", record.get("section", "")),
                    "part": record.get("part", ""),
                    "record_id": record.get("id", ""),
                    "source": source_title,
                }
            )

        # Also index legal notes as separate chunks
        for note in record.get("legal_notes", []):
            note_chunks = splitter.split_text(note)
            for chunk in note_chunks:
                documents.append(
                    {
                        "text": chunk,
                        "section": record.get("title", record.get("section", "")),
                        "part": record.get("part", ""),
                        "record_id": record.get("id", ""),
                        "source": f"{source_title} [Legal Note]",
                    }
                )

    return documents
