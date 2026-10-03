# Retrieval — to be implemented
def get_relevant_documents(vectorstore, question):

    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )

    return retriever.invoke(question)