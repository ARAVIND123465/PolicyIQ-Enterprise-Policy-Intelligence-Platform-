"""
PolicyAI — Employee Portal API Router
Endpoints for Employee Self-Service: My Profile, Directory, and Photo Retrieval.
"""

from fastapi import APIRouter, HTTPException, Depends, Header, Response
from fastapi.responses import FileResponse, Response
from typing import Optional
from sqlalchemy.orm import Session
from pathlib import Path
import os

from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeResponse, EmployeeListResponse, EmployeeUpdate
from app.services.employee_service import EmployeeService, _employee_to_response

router = APIRouter(prefix="/api/employees", tags=["Employees"])
employee_service = EmployeeService()


def _generate_default_avatar_svg(name: str) -> str:
    """Generate a clean SVG avatar with initials for employees without photos."""
    initials = "".join([part[0].upper() for part in name.split()[:2]]) or "EM"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#grad)"/>
  <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">{initials}</text>
</svg>"""


@router.get("/me", response_model=EmployeeResponse)
async def get_my_profile(
    x_user_email: Optional[str] = Header(None),
    x_user_name: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve the current logged-in employee's profile.
    Matches by email or full_name, or falls back to the default demo employee (EMP-1001).
    """
    emp = None
    if x_user_email:
        emp = db.query(Employee).filter(Employee.email.ilike(x_user_email.strip())).first()
    if not emp and x_user_name:
        emp = db.query(Employee).filter(Employee.full_name.ilike(f"%{x_user_name.strip()}%")).first()
    if not emp:
        # Fallback to the primary demo employee
        emp = db.query(Employee).filter(Employee.employee_id == "EMP-1001").first()
    if not emp:
        # Fallback to first available employee
        emp = db.query(Employee).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found.")

    return _employee_to_response(emp, db)


@router.patch("/me", response_model=EmployeeResponse)
async def update_my_profile(
    data: EmployeeUpdate,
    x_user_email: Optional[str] = Header(None),
    x_user_name: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    Allow an employee to update only allowed profile fields (e.g. phone, contact info).
    Restricted fields like role, department, team, status cannot be modified by employees.
    """
    emp = None
    if x_user_email:
        emp = db.query(Employee).filter(Employee.email.ilike(x_user_email.strip())).first()
    if not emp and x_user_name:
        emp = db.query(Employee).filter(Employee.full_name.ilike(f"%{x_user_name.strip()}%")).first()
    if not emp:
        emp = db.query(Employee).filter(Employee.employee_id == "EMP-1001").first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found.")

    # Business rule: Employee can only update phone and full_name (contact preferences), NOT department, role, team, or status
    if data.phone is not None:
        emp.phone = data.phone
    if data.full_name is not None and data.full_name.strip():
        emp.full_name = data.full_name.strip()

    db.commit()
    db.refresh(emp)
    return _employee_to_response(emp, db)


@router.get("/{employee_id}/photo")
async def get_employee_photo(
    employee_id: str,
    db: Session = Depends(get_db),
):
    """
    Serve employee profile photo safely.
    If no photo is uploaded, returns a dynamic SVG avatar.
    """
    emp = employee_service.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    photo_path = employee_service.get_photo_path(db, employee_id)
    if photo_path and os.path.exists(photo_path):
        suffix = Path(photo_path).suffix.lower()
        media_type = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
        }.get(suffix, "image/jpeg")
        return FileResponse(photo_path, media_type=media_type)

    # Return default SVG avatar
    svg_content = _generate_default_avatar_svg(emp.full_name)
    return Response(content=svg_content, media_type="image/svg+xml")


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee_by_id(
    employee_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve public employee profile by ID."""
    emp = employee_service.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    return emp


@router.get("", response_model=EmployeeListResponse)
async def list_employees_public(
    search: Optional[str] = None,
    department: Optional[str] = None,
    team: Optional[str] = None,
    role: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    """Employee directory query for all staff members."""
    return employee_service.list_employees(
        db, search=search, department=department, team=team,
        role=role, status="Active", page=page, page_size=page_size,
    )
