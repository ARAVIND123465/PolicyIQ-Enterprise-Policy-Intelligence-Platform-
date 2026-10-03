# Document ingestion — to be implemented
import json
from pathlib import Path


def load_json(file_path: str):
    path = Path(file_path)

    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data


    from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(data):

    documents = []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    for section in data["sections"]:
        chunks = splitter.split_text(section["content"])

        for chunk in chunks:
            documents.append({
                "text": chunk,
                "section": section["section"],
                "source": data["source"]
            })

    return documents