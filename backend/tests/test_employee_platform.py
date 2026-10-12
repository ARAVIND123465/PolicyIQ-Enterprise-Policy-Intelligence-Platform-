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
    res = client.get("/api/hr/dashboard/stats", headers={"X-User-Role": "employee"})
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

    res_no_header = client.get("/api/hr/dashboard/stats")
    assert res_no_header.status_code == 403


def test_hr_endpoint_allows_hr_role():
    """Accessing HR endpoints with X-User-Role: hr succeeds."""
    res = client.get("/api/hr/dashboard/stats", headers={"X-User-Role": "hr"})
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "active_employees" in data
    assert data["total_employees"] >= 1


# ── 2. Employee Directory & Filters Tests ────────────────────────────────────

def test_list_employees_and_filters():
    """Directory listing and filter options endpoints return properly structured data."""
    res = client.get("/api/hr/employees", headers={"X-User-Role": "hr"})
    assert res.status_code == 200
    data = res.json()
    assert "employees" in data
    assert "total" in data

    # Filter options endpoint
    res_opts = client.get("/api/hr/employees/filters", headers={"X-User-Role": "hr"})
    assert res_opts.status_code == 200
    opts = res_opts.json()
    assert "departments" in opts
    assert "teams" in opts


# ── 3. Employee CRUD Tests ──────────────────────────────────────────────────

def test_employee_crud_lifecycle():
    """Create, fetch, update, and delete an employee record."""
    test_id = "TEST-9999"
    payload = {
        "employee_id": test_id,
        "full_name": "Test Employee Lifecycle",
        "email": "test.lifecycle@company.com",
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
    assert created["employee_id"] == test_id
    assert created["full_name"] == "Test Employee Lifecycle"

    # Duplicate check
    dup_res = client.post("/api/hr/employees", json=payload, headers={"X-User-Role": "hr"})
    assert dup_res.status_code == 400

    # Fetch
    get_res = client.get(f"/api/hr/employees/{test_id}", headers={"X-User-Role": "hr"})
    assert get_res.status_code == 200
    assert get_res.json()["employee_id"] == test_id

    # Update
    update_res = client.patch(
        f"/api/hr/employees/{test_id}",
        json={"role": "Lead QA Engineer", "phone": "+1 555-0999"},
        headers={"X-User-Role": "hr"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["role"] == "Lead QA Engineer"

    # Photo upload
    fake_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    upload_res = client.post(
        f"/api/hr/employees/{test_id}/photo",
        files={"file": ("profile.png", io.BytesIO(fake_png), "image/png")},
        headers={"X-User-Role": "hr"},
    )
    assert upload_res.status_code == 200

    # Retrieve photo
    photo_res = client.get(f"/api/employees/{test_id}/photo")
    assert photo_res.status_code == 200

    # Self-service me profile check
    me_res = client.get(
        "/api/employees/me",
        headers={"X-User-Email": "test.lifecycle@company.com"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["employee_id"] == test_id

    # Self-service patch check
    me_patch = client.patch(
        "/api/employees/me",
        json={"phone": "+1 555-8888"},
        headers={"X-User-Email": "test.lifecycle@company.com"},
    )
    assert me_patch.status_code == 200
    assert me_patch.json()["phone"] == "+1 555-8888"

    # Delete
    del_res = client.delete(f"/api/hr/employees/{test_id}", headers={"X-User-Role": "hr"})
    assert del_res.status_code == 200
    assert del_res.json()["deleted"] is True

    # Verify deleted
    assert client.get(f"/api/hr/employees/{test_id}", headers={"X-User-Role": "hr"}).status_code == 404


# ── 4. HR AI Assistant Database Query Tests ─────────────────────────────────

def test_hr_ai_assistant_queries():
    """HR queries receive database-grounded answers."""
    # Headcount query
    res = client.post(
        "/api/chat",
        json={"message": "How many total employees do we have?", "role": "hr"},
    )
    assert res.status_code == 200
    assert "registered employees" in res.json()["answer"]

    # Restricted query for non-HR
    res_emp = client.post(
        "/api/chat",
        json={"message": "How many active employees are in the Engineering department?", "role": "employee"},
    )
    assert res_emp.status_code == 200
    assert "Access Restricted" in res_emp.json()["answer"]
