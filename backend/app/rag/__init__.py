# RAG pipeline package — implementation to be added by developer
from langchain_community.vectorstores import FAISS
from app.rag.embeddings.embedding_model import get_embeddings


def create_vectorstore(documents):

    texts = [doc["text"] for doc in documents]

    metadatas = [
        {
            "section": doc["section"],
            "source": doc["source"]
        }
        for doc in documents
    ]

    embeddings = get_embeddings()

    vectorstore = FAISS.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas
    )

    return vectorstore