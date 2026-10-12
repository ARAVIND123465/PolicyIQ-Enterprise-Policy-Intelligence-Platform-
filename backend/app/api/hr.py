"""
PolicyAI — HR API Router
Endpoints for the HR portal: dashboard stats, employee management, photo uploads.

NOTE: In the current demo setup, role enforcement is handled by the frontend
(same as the existing auth system). The backend checks the X-User-Role header
as a lightweight guard — this mirrors the existing client-side auth pattern.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header, Query
from fastapi.responses import FileResponse
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse, DashboardStats
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/api/hr", tags=["HR"])
employee_service = EmployeeService()


def require_hr_role(x_user_role: str = Header(default="employee")):
    """Lightweight role check — mirrors the existing client-side auth."""
    if x_user_role != "hr":
        raise HTTPException(status_code=403, detail="Access denied. HR role required.")
    return x_user_role


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Return real-time HR dashboard statistics from the database."""
    return employee_service.get_dashboard_stats(db)


# ── Employee Directory ───────────────────────────────────────────────────────

@router.get("/employees", response_model=EmployeeListResponse)
async def list_employees(
    search: Optional[str] = Query(None, description="Search by name, ID, or email"),
    department: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("full_name", description="Sort field"),
    sort_order: str = Query("asc", description="asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """List employees with search, filter, sort, and pagination."""
    return employee_service.list_employees(
        db, search=search, department=department, team=team,
        role=role, status=status, sort_by=sort_by, sort_order=sort_order,
        page=page, page_size=page_size,
    )


@router.get("/employees/filters")
async def get_filter_options(
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Get distinct filter values for department, team, role, and status."""
    return employee_service.get_filter_options(db)


# ── Employee CRUD ────────────────────────────────────────────────────────────

@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Get a single employee by their employee ID."""
    emp = employee_service.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    return emp


@router.post("/employees", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Create a new employee record."""
    try:
        return employee_service.create_employee(db, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Update an existing employee record."""
    try:
        return employee_service.update_employee(db, employee_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: str,
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Delete an employee record."""
    try:
        employee_service.delete_employee(db, employee_id)
        return {"deleted": True, "employee_id": employee_id}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# ── Photo Management ─────────────────────────────────────────────────────────

@router.post("/employees/{employee_id}/photo")
async def upload_photo(
    employee_id: str,
    file: UploadFile = File(...),
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Upload or update an employee's profile photo."""
    try:
        content = await file.read()
        photo_url = employee_service.save_photo(
            db, employee_id, content, file.filename or "photo.jpg", file.content_type or "image/jpeg"
        )
        return {"photo_url": photo_url, "message": "Photo uploaded successfully."}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/employees/{employee_id}/photo")
async def remove_photo(
    employee_id: str,
    _role: str = Depends(require_hr_role),
    db: Session = Depends(get_db),
):
    """Remove an employee's profile photo."""
    try:
        employee_service.remove_photo(db, employee_id)
        return {"message": "Photo removed successfully."}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
