"""
Comprehensive Test Suite for PolicyAI Employee Intelligence Platform
Verifies:
- DB initialisation and seeding
- Role-based authorization & header guards
- HR Dashboard stats
- Employee Directory listing, search, filtering
- Employee CRUD & photo management
- Employee Self-Service (/api/employees/me)
- RAG / Database chat routing
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.services.employee_service import EmployeeService

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database and seed data are ready."""
    init_db()
    db = SessionLocal()
    try:
        EmployeeService().seed_sample_employees(db)
    finally:
        db.close()


# ── 1. Role-Based Authorization Guard Tests ─────────────────────────────────

def test_hr_endpoint_requires_hr_role():
    """Accessing HR endpoints without HR role header returns 403 Forbidden."""
    # With default employee role header
    res = client.get("/api/hr/dashboard/stats", headers={"X-User-Role": "employee"})
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

    # Without header (defaults to employee)
    res_no_header = client.get("/api/hr/dashboard/stats")
    assert res_no_header.status_code == 403


def test_hr_endpoint_allows_hr_role():
    """Accessing HR endpoints with X-User-Role: hr succeeds."""
    res = client.get("/api/hr/dashboard/stats", headers={"X-User-Role": "hr"})
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "active_employees" in data
    assert data["total_employees"] >= 12
    assert data["active_employees"] >= 10
    assert data["total_teams"] >= 4
    assert data["total_departments"] >= 3


# ── 2. Employee Directory & Filters Tests ────────────────────────────────────

def test_list_employees_with_search_and_filters():
    """Search and filter employees properly filter SQLite results."""
    # Search by name
    res = client.get("/api/hr/employees?search=Arjun", headers={"X-User-Role": "hr"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["employees"]) >= 1
    assert data["employees"][0]["full_name"] == "Arjun Kumar"
    assert data["employees"][0]["employee_id"] == "EMP-1001"

    # Filter by department
    res_eng = client.get("/api/hr/employees?department=Engineering", headers={"X-User-Role": "hr"})
    assert res_eng.status_code == 200
    eng_data = res_eng.json()
    assert all(e["department"] == "Engineering" for e in eng_data["employees"])

    # Filter options endpoint
    res_opts = client.get("/api/hr/employees/filters", headers={"X-User-Role": "hr"})
    assert res_opts.status_code == 200
    opts = res_opts.json()
    assert "Engineering" in opts["departments"]
    assert "Human Resources" in opts["departments"]


# ── 3. Employee CRUD Tests ──────────────────────────────────────────────────

def test_employee_crud_lifecycle():
    """Create, fetch, update, and delete an employee record."""
    new_id = "EMP-9999"
    payload = {
        "employee_id": new_id,
        "full_name": "Test Engineer",
        "email": "test.engineer@company.com",
        "role": "QA Automation Engineer",
        "department": "Engineering",
        "team": "Quality Assurance",
        "status": "Active",
        "phone": "+1 555-0100",
    }

    # Create
    create_res = client.post("/api/hr/employees", json=payload, headers={"X-User-Role": "hr"})
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["employee_id"] == new_id
    assert created["full_name"] == "Test Engineer"

    # Fetch
    get_res = client.get(f"/api/hr/employees/{new_id}", headers={"X-User-Role": "hr"})
    assert get_res.status_code == 200
    assert get_res.json()["employee_id"] == new_id

    # Update
    update_res = client.patch(
        f"/api/hr/employees/{new_id}",
        json={"role": "Lead QA Engineer", "phone": "+1 555-0999"},
        headers={"X-User-Role": "hr"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["role"] == "Lead QA Engineer"

    # Delete
    del_res = client.delete(f"/api/hr/employees/{new_id}", headers={"X-User-Role": "hr"})
    assert del_res.status_code == 200
    assert del_res.json()["deleted"] is True

    # Verify not found
    get_after_del = client.get(f"/api/hr/employees/{new_id}", headers={"X-User-Role": "hr"})
    assert get_after_del.status_code == 404


def test_duplicate_employee_id_rejected():
    """Attempting to create duplicate employee ID returns 400 Bad Request."""
    payload = {
        "employee_id": "EMP-1001",  # Already exists (Arjun Kumar)
        "full_name": "Duplicate Person",
        "email": "duplicate@company.com",
        "role": "Developer",
        "department": "Engineering",
        "team": "AI",
    }
    res = client.post("/api/hr/employees", json=payload, headers={"X-User-Role": "hr"})
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


# ── 4. Photo Upload and Fallback Tests ───────────────────────────────────────

def test_employee_photo_upload_and_serving():
    """Upload custom employee photo and retrieve it; test SVG avatar fallback."""
    # Test avatar fallback for employee without photo
    res_avatar = client.get("/api/employees/EMP-1002/photo")
    assert res_avatar.status_code == 200
    assert "image/svg+xml" in res_avatar.headers["content-type"]
    assert "<svg" in res_avatar.text

    # Upload test image
    fake_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    upload_res = client.post(
        "/api/hr/employees/EMP-1001/photo",
        files={"file": ("profile.png", io.BytesIO(fake_png), "image/png")},
        headers={"X-User-Role": "hr"},
    )
    assert upload_res.status_code == 200
    assert "photo_url" in upload_res.json()

    # Retrieve uploaded photo
    photo_res = client.get("/api/employees/EMP-1001/photo")
    assert photo_res.status_code == 200
    assert photo_res.headers["content-type"] == "image/png"


# ── 5. Employee Self-Service (/api/employees/me) Tests ───────────────────────

def test_employee_self_service_profile():
    """Employee self-service gets profile and updates allowed fields."""
    # Get profile for Arjun Kumar via email header
    res = client.get(
        "/api/employees/me",
        headers={"X-User-Email": "arjun.kumar@company.com"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["employee_id"] == "EMP-1001"
    assert data["full_name"] == "Arjun Kumar"

    # Permitted update (phone)
    patch_res = client.patch(
        "/api/employees/me",
        json={"phone": "+1 555-4321"},
        headers={"X-User-Email": "arjun.kumar@company.com"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["phone"] == "+1 555-4321"


# ── 6. HR AI Assistant Database Query Tests ─────────────────────────────────

def test_hr_ai_assistant_headcount_queries():
    """HR role receives database-grounded headcount answers."""
    # 1. Engineering headcount query
    res = client.post(
        "/api/chat",
        json={"message": "How many active employees are in the Engineering department?", "role": "hr"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "Engineering" in data["answer"]
    assert "active employees" in data["answer"].lower()
    assert any("SQLite" in s["source"] for s in data["sources"])

    # 2. Teams with most employees query
    res_teams = client.post(
        "/api/chat",
        json={"message": "Which teams have the most employees?", "role": "hr"},
    )
    assert res_teams.status_code == 200
    assert "Top Teams" in res_teams.json()["answer"]

    # 3. Regular employee asking confidential headcount is redirected to policy assistant
    res_emp_restricted = client.post(
        "/api/chat",
        json={"message": "How many active employees are in the Engineering department?", "role": "employee"},
    )
    assert res_emp_restricted.status_code == 200
    assert "Access Restricted" in res_emp_restricted.json()["answer"]
