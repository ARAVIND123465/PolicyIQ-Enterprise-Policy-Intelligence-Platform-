"""
PolicyAI — Chat Service
Wires the RAG pipeline into the chat API.

The vectorstore is built once (from the handbook JSON) on the first request
and cached in memory for all subsequent requests.
"""

import uuid
import os
import asyncio
from typing import Optional
from app.schemas.chat import ChatRequest, ChatResponse, Source
from app.config import get_settings
from app.rag.rag_pipeline import build_rag, ask_rag

settings = get_settings()

from datetime import datetime

# Module-level cache — built once, reused forever
_vectorstore = None
_conversations: dict[str, list[dict]] = {}


def _get_vectorstore():
    """Build and cache the FAISS vectorstore from the handbook JSON."""
    global _vectorstore
    if _vectorstore is None:
        json_path = settings.HANDBOOK_JSON
        if not os.path.exists(json_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            candidates = [
                os.path.join(base_dir, "data", "employee_handbook.json"),
                os.path.join(os.path.dirname(base_dir), "data", "documents", "employee_handbook.json"),
                "/var/task/app/data/employee_handbook.json",
                "/var/task/data/documents/employee_handbook.json",
            ]
            for cand in candidates:
                if os.path.exists(cand):
                    json_path = cand
                    break
        if not os.path.exists(json_path):
            raise FileNotFoundError(
                f"Handbook JSON not found at: {json_path}\n"
                "Please place employee_handbook.json in backend/app/data/ or backend/data/documents/"
            )
        _vectorstore = build_rag(json_path)
    return _vectorstore


from sqlalchemy import func
from app.database import SessionLocal
from app.models.employee import Employee


def _answer_employee_data_query(message: str, role: str) -> Optional[tuple[str, list[Source]]]:
    """
    Check if query is asking about employee statistics, headcount, or directory data.
    If so, queries the live SQLite database directly instead of vector search.
    """
    msg = message.lower()
    
    # Check keywords indicating HR employee/headcount queries
    has_headcount = any(k in msg for k in ["how many employee", "how many active", "headcount", "employee count", "number of employee"])
    has_teams = any(k in msg for k in ["which team", "teams have the most", "most employee", "team distribution"])
    has_dept = any(k in msg for k in ["in engineering", "in human resources", "in product", "in design", "in finance", "department"])
    has_members = any(k in msg for k in ["who belongs to", "which employee", "employees belong to", "members of"])

    if not (has_headcount or has_teams or (has_dept and "employee" in msg) or (has_members and "team" in msg)):
        return None

    # Role enforcement check
    if role != "hr":
        return (
            "Access Restricted: Comprehensive organization headcount and department employee directories are reserved for HR personnel. As an employee, you can browse verified company policies and handbook guidelines using this assistant.",
            [Source(source="PolicyAI RBAC", section="Access Control Policy")]
        )

    db = SessionLocal()
    try:
        # 1. "Which teams have the most employees?"
        if "most employee" in msg or ("which team" in msg and "most" in msg):
            team_counts = (
                db.query(Employee.team, func.count(Employee.id))
                .filter(Employee.status == "Active")
                .group_by(Employee.team)
                .order_by(func.count(Employee.id).desc())
                .all()
            )
            if team_counts:
                lines = [f"**Top Teams by Active Headcount:**\n"]
                for team, cnt in team_counts:
                    lines.append(f"- **{team}**: {cnt} employee{'s' if cnt > 1 else ''}")
                ans = "\n".join(lines)
                return (
                    ans,
                    [Source(source="SQLite Database", section="employees.team", part="Aggregate Query")]
                )

        # 2. "How many active employees are in the Engineering department?" or similar dept query
        for dept_name in ["Engineering", "Human Resources", "Product", "Design", "Marketing", "Finance"]:
            if dept_name.lower() in msg and ("how many" in msg or "count" in msg or "headcount" in msg):
                active_count = (
                    db.query(Employee)
                    .filter(Employee.department.ilike(dept_name), Employee.status == "Active")
                    .count()
                )
                total_dept = db.query(Employee).filter(Employee.department.ilike(dept_name)).count()
                employees = (
                    db.query(Employee)
                    .filter(Employee.department.ilike(dept_name), Employee.status == "Active")
                    .all()
                )
                emp_list = ", ".join([f"{e.full_name} ({e.role})" for e in employees[:6]])
                ans = (
                    f"There are **{active_count} active employees** in the **{dept_name}** department "
                    f"(out of {total_dept} total records).\n\n"
                    f"**Active Members:** {emp_list}."
                )
                return (
                    ans,
                    [Source(source="SQLite Database", section=f"employees.department = '{dept_name}'")]
                )

        # 3. "Which employees belong to the [Team Name] team?"
        for team_candidate in ["AI & Automation", "Data Science", "Core Platform", "Product Design", "Infrastructure", "HR Operations", "Quality Assurance", "Digital Marketing", "Financial Planning", "Web Platform", "Talent Acquisition"]:
            if team_candidate.lower() in msg:
                members = db.query(Employee).filter(Employee.team.ilike(team_candidate)).all()
                if members:
                    member_lines = [f"- **{m.full_name}** ({m.employee_id}) — {m.role} [{m.status}]" for m in members]
                    ans = f"The following **{len(members)} employee(s)** belong to the **{team_candidate}** team:\n\n" + "\n".join(member_lines)
                    return (
                        ans,
                        [Source(source="SQLite Database", section=f"employees.team = '{team_candidate}'")]
                    )

        # 4. General headcount query e.g. "How many total employees?"
        if has_headcount or "total employee" in msg:
            total = db.query(Employee).count()
            active = db.query(Employee).filter(Employee.status == "Active").count()
            teams_cnt = db.query(func.distinct(Employee.team)).count()
            dept_cnt = db.query(func.distinct(Employee.department)).count()
            ans = (
                f"Currently, there are **{total} total registered employees** across the company, "
                f"with **{active} currently active**. They span **{teams_cnt} teams** and **{dept_cnt} departments**."
            )
            return (
                ans,
                [Source(source="SQLite Database", section="employees summary")]
            )

        return None
    finally:
        db.close()


class ChatService:
    """Handles user questions by querying the RAG pipeline or database."""

    async def handle_message(self, request: ChatRequest) -> ChatResponse:
        """
        Process a user message through live database queries (for HR employee stats)
        or the RAG pipeline (for company policies and handbook guidelines).
        """
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # Check if this is an employee directory / headcount query
        db_answer = _answer_employee_data_query(request.message, request.role or "employee")
        if db_answer:
            answer_text, sources = db_answer
            now_iso = datetime.utcnow().isoformat() + "Z"
            if conversation_id not in _conversations:
                _conversations[conversation_id] = []
            _conversations[conversation_id].append({
                "id": f"u-{int(datetime.utcnow().timestamp()*1000)}",
                "role": "user",
                "content": request.message,
                "timestamp": now_iso,
            })
            _conversations[conversation_id].append({
                "id": f"a-{int(datetime.utcnow().timestamp()*1000)}",
                "role": "assistant",
                "content": answer_text,
                "sources": [s.model_dump() for s in sources],
                "timestamp": now_iso,
            })
            return ChatResponse(
                answer=answer_text,
                sources=sources,
                conversation_id=conversation_id,
            )

        # Load (or reuse cached) vectorstore
        vectorstore = _get_vectorstore()

        # Retrieve prior chat history for this conversation
        history = _conversations.get(conversation_id, [])

        # Run RAG in worker thread to prevent blocking FastAPI event loop
        result = await asyncio.to_thread(ask_rag, vectorstore, request.message, history)

        # Map RAG sources → schema
        sources = [
            Source(
                source=s.get("source", ""),
                section=s.get("section", ""),
                part=s.get("part"),
                record_id=s.get("record_id"),
            )
            for s in result.get("sources", [])
        ]

        # Record conversation turns
        now_iso = datetime.utcnow().isoformat() + "Z"
        if conversation_id not in _conversations:
            _conversations[conversation_id] = []

        _conversations[conversation_id].append({
            "id": f"u-{int(datetime.utcnow().timestamp()*1000)}",
            "role": "user",
            "content": request.message,
            "timestamp": now_iso,
        })
        _conversations[conversation_id].append({
            "id": f"a-{int(datetime.utcnow().timestamp()*1000)}",
            "role": "assistant",
            "content": result["answer"],
            "sources": [s.model_dump() for s in sources],
            "timestamp": now_iso,
        })

        return ChatResponse(
            answer=result["answer"],
            sources=sources,
            conversation_id=conversation_id,
        )

    def get_history(self) -> list[dict]:
        """Return list of conversation summaries."""
        summaries = []
        for cid, msgs in _conversations.items():
            if not msgs:
                continue
            first_user = next((m for m in msgs if m["role"] == "user"), None)
            title = first_user["content"][:45] if first_user else "Conversation"
            last_msg = msgs[-1]
            summaries.append({
                "id": cid,
                "title": title,
                "preview": last_msg["content"][:80],
                "timestamp": last_msg.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                "group": "Today",
            })
        # Sort newest first
        summaries.reverse()
        return summaries

    def get_conversation_messages(self, conversation_id: str) -> list[dict]:
        """Return all messages for a given conversation thread."""
        return _conversations.get(conversation_id, [])

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a conversation thread."""
        if conversation_id in _conversations:
            del _conversations[conversation_id]
            return True
        return False

