"""
generation/generator.py
Generate a grounded answer from retrieved policy chunks using Gemini.
Handles greetings, career/promotion guidance, out-of-scope queries, and policy questions.
Includes automatic fallback across Gemini models and quota error recovery.
"""

import re
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """\
You are PolicyAI, an intelligent and supportive company HR policy assistant.

Follow these instructions:

1. GREETINGS & CASUAL TALK:
   If the user says hello, hi, good morning, thanks, or asks what you can do, greet them warmly and politely explain that you are here to assist with company policies (leaves, benefits, working hours, and conduct).

2. PROMOTIONS, APPRAISALS & CAREER GROWTH:
   If the user asks about getting a promotion, career progression, or appraisals (for example: "if I work for two years will I get a promotion?", "how do I get promoted?", "career growth"):
   Provide a supportive, motivating, and clear HR response:
   - Emphasize that while tenure (e.g., working for 2 years) is valued, promotions are fundamentally **performance-driven**.
   - Explain that if an employee **works very well**, **completes projects on time**, shows dedication, takes initiative, and consistently delivers high-quality results, they build a strong case to definitely earn a promotion.
   - Outline key steps:
     * **High Performance**: Consistently deliver projects on schedule and exceed goals.
     * **Initiative & Ownership**: Take on new challenges and help teammates.
     * **Performance Reviews**: Discuss your achievements and goals during formal appraisal cycles.
     * **Manager 1-on-1**: Schedule regular discussions with your reporting manager or HR to review progress, receive feedback, and align on a promotion roadmap.
   - Keep the tone encouraging, professional, and positive.

3. IRRELEVANT QUESTIONS:
   If the user asks an unrelated general question that has nothing to do with company policies, employee benefits, leaves, career, or workplace guidelines (e.g. general trivia, coding, recipes, sports, entertainment), politely reply:
   "This question is not related to company policies. I am here to help you with company workplace policies, benefits, leave, and HR guidelines. How can I assist you with our company policies today?"

4. DOCUMENTED POLICY QUESTIONS:
   If the question is about specific company policies covered in the handbook (such as vacation leave, sick leave, bereavement, insurance, overtime, dress code), answer accurately using the provided Context. Maintain conversational context if this is a follow-up question. Format your answer clearly using Markdown with bullet points or bold text.

5. UNKNOWN POLICY DETAILS:
   If the question asks for a specific documented handbook rule or figure that is genuinely not mentioned in the Context, reply:
   "I could not find this information in the company policy."

{chat_history}Context:
{context}

Question:
{question}

Answer:
"""

# Quick matching for common greetings
_GREETING_PATTERNS = {
    "hi", "hello", "hey", "heya", "hi there", "hello there",
    "good morning", "good afternoon", "good evening",
    "greetings", "help", "who are you", "what can you do",
}

# Promotion / Career growth intent indicators
_PROMOTION_KEYWORDS = [
    "promotion", "promoted", "promossion", "promossesion", "promot",
    "career growth", "career progression", "get a raise", "salary appraisal",
    "performance appraisal", "how to get promoted",
]

_CANDIDATE_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
]


def generate_answer(question: str, documents: list, chat_history: list = None) -> str:
    """
    Build a prompt from retrieved chunks and generate an answer using Gemini.
    With greeting detection, promotion guidance, chat history context, and fast model fallback.
    """
    cleaned = re.sub(r"[^\w\s]", "", question.strip().lower())

    # 1. Instant greeting handler
    if cleaned in _GREETING_PATTERNS:
        return (
            "Hello! I am your **PolicyAI** assistant. 👋\n\n"
            "How can I help you with our company policies today? You can ask me about:\n"
            "* **Leave & Time Off** (vacation, sick leave, bereavement, jury duty)\n"
            "* **Benefits & Insurance** (health coverage, 401k, disability)\n"
            "* **Holidays & Working Hours** (overtime, standard workweek)\n"
            "* **Code of Conduct & Career Guidelines**"
        )

    # 2. Promotion & Career growth guidance handler
    if any(k in cleaned for k in _PROMOTION_KEYWORDS):
        return (
            "That's a great question about career progression! While working for 2 years demonstrates "
            "dedication and experience, promotions in our organization are primarily **performance-driven**.\n\n"
            "If you **work very well**, **complete your projects on time**, and consistently exceed expectations, "
            "you build a very strong foundation to definitely earn a promotion.\n\n"
            "### 🎯 Key Steps to Secure a Promotion:\n"
            "* **High Performance & Timing**: Consistently finish projects on schedule with high quality and accuracy.\n"
            "* **Ownership & Initiative**: Proactively take on new responsibilities and support your team members.\n"
            "* **Formal Appraisals**: Actively participate in your annual and mid-year performance reviews to highlight your contributions and milestones.\n"
            "* **Manager 1-on-1**: Set up regular catch-ups with your reporting manager or HR to request feedback and align on a promotion roadmap.\n\n"
            "Delivering quality work on time and communicating proactively with your manager is the best formula for career advancement!"
        )

    # 3. Format conversational history if present
    chat_history_str = ""
    if chat_history:
        history_lines = []
        for msg in chat_history[-4:]:
            role = "User" if msg.get("role") == "user" else "PolicyAI"
            history_lines.append(f"{role}: {msg.get('content', '')}")
        if history_lines:
            chat_history_str = "Recent Conversation History:\n" + "\n".join(history_lines) + "\n\n"

    # 4. LLM generation with fast model fallback
    settings = get_settings()
    context = "\n\n".join(doc.page_content for doc in documents)
    prompt = _PROMPT_TEMPLATE.format(chat_history=chat_history_str, context=context, question=question)

    last_error = None
    for model_name in _CANDIDATE_MODELS:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                temperature=0.1,
                google_api_key=settings.GOOGLE_API_KEY,
                max_retries=0,
                timeout=25,
            )
            response = llm.invoke(prompt)
            return response.content
        except Exception as exc:
            last_error = exc
            logger.warning(f"Model {model_name} failed: {exc}. Trying next model...")


    logger.error(f"All candidate models failed. Last error: {last_error}")
    return "I am currently experiencing high demand. Please try asking your question again in a moment."
