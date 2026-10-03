# Answer generation — to be implemented
from langchain_google_genai import ChatGoogleGenerativeAI


def generate_answer(question, documents):

    context = "\n\n".join(
        doc.page_content for doc in documents
    )

    prompt = f"""
You are a company policy assistant.

Answer the question only using the provided context.

If the answer is not present in the context,
say: "I could not find this information in the company policy."

Context:
{context}

Question:
{question}

Answer:
"""

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0
    )

    response = llm.invoke(prompt)

    return response.content