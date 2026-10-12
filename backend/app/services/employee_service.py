"""
PolicyAI — Employee Service
Database CRUD operations for employee management.
"""

import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    EmployeeListResponse, DashboardStats,
)

# Upload directory for employee photos
_BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = _BACKEND_DIR / "data" / "uploads" / "photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Max photo file size: 2 MB
MAX_PHOTO_SIZE = 2 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_PHOTO_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def _employee_to_response(emp: Employee, db: Session) -> EmployeeResponse:
    """Convert an Employee ORM object to an EmployeeResponse schema."""
    manager_name = None
    if emp.manager_id:
        manager = db.query(Employee).filter(Employee.id == emp.manager_id).first()
        if manager:
            manager_name = manager.full_name

    photo_url = None
    if emp.photo_path:
        photo_url = f"/api/employees/{emp.employee_id}/photo"

    return EmployeeResponse(
        id=emp.id,
        employee_id=emp.employee_id,
        full_name=emp.full_name,
        email=emp.email,
        photo_url=photo_url,
        role=emp.role,
        department=emp.department,
        team=emp.team,
        phone=emp.phone,
        manager_id=emp.manager_id,
        manager_name=manager_name,
        joining_date=emp.joining_date,
        status=emp.status,
        created_at=emp.created_at,
        updated_at=emp.updated_at,
    )


class EmployeeService:
    """Handles all employee CRUD operations."""

    def list_employees(
        self,
        db: Session,
        search: Optional[str] = None,
        department: Optional[str] = None,
        team: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "full_name",
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 20,
    ) -> EmployeeListResponse:
        """List employees with search, filter, sort, and pagination."""
        query = db.query(Employee)

        # Search by name or employee ID
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Employee.full_name.ilike(search_term),
                    Employee.employee_id.ilike(search_term),
                    Employee.email.ilike(search_term),
                )
            )

        # Filters
        if department:
            query = query.filter(Employee.department == department)
        if team:
            query = query.filter(Employee.team == team)
        if role:
            query = query.filter(Employee.role == role)
        if status:
            query = query.filter(Employee.status == status)

        # Total count before pagination
        total = query.count()

        # Sort
        sort_col = getattr(Employee, sort_by, Employee.full_name)
        if sort_order == "desc":
            query = query.order_by(sort_col.desc())
        else:
            query = query.order_by(sort_col.asc())

        # Pagination
        offset = (page - 1) * page_size
        employees = query.offset(offset).limit(page_size).all()

        return EmployeeListResponse(
            employees=[_employee_to_response(e, db) for e in employees],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get_employee_by_id(self, db: Session, employee_id: str) -> Optional[EmployeeResponse]:
        """Get a single employee by their employee_id string (e.g. EMP-1001)."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp:
            return None
        return _employee_to_response(emp, db)

    def get_employee_by_db_id(self, db: Session, db_id: int) -> Optional[EmployeeResponse]:
        """Get a single employee by their database primary key."""
        emp = db.query(Employee).filter(Employee.id == db_id).first()
        if not emp:
            return None
        return _employee_to_response(emp, db)

    def create_employee(self, db: Session, data: EmployeeCreate) -> EmployeeResponse:
        """Create a new employee record."""
        # Check for duplicate employee_id
        existing = db.query(Employee).filter(Employee.employee_id == data.employee_id).first()
        if existing:
            raise ValueError(f"Employee ID '{data.employee_id}' already exists.")

        # Check for duplicate email
        existing_email = db.query(Employee).filter(Employee.email == data.email).first()
        if existing_email:
            raise ValueError(f"Email '{data.email}' is already registered.")

        # Validate status
        valid_statuses = {"Active", "On Leave", "Inactive"}
        if data.status not in valid_statuses:
            raise ValueError(f"Invalid status '{data.status}'. Must be one of: {valid_statuses}")

        emp = Employee(
            employee_id=data.employee_id,
            full_name=data.full_name,
            email=data.email,
            role=data.role,
            department=data.department,
            team=data.team,
            phone=data.phone,
            manager_id=data.manager_id,
            joining_date=data.joining_date,
            status=data.status,
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
        return _employee_to_response(emp, db)

    def update_employee(self, db: Session, employee_id: str, data: EmployeeUpdate) -> EmployeeResponse:
        """Update an existing employee record."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee '{employee_id}' not found.")

        update_data = data.model_dump(exclude_unset=True)

        # Check email uniqueness if being changed
        if "email" in update_data and update_data["email"] != emp.email:
            existing_email = db.query(Employee).filter(Employee.email == update_data["email"]).first()
            if existing_email:
                raise ValueError(f"Email '{update_data['email']}' is already registered.")

        # Validate status if being changed
        if "status" in update_data:
            valid_statuses = {"Active", "On Leave", "Inactive"}
            if update_data["status"] not in valid_statuses:
                raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")

        for field, value in update_data.items():
            setattr(emp, field, value)

        emp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(emp)
        return _employee_to_response(emp, db)

    def delete_employee(self, db: Session, employee_id: str) -> bool:
        """Delete an employee record."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee '{employee_id}' not found.")

        # Remove photo file if exists
        if emp.photo_path and os.path.exists(emp.photo_path):
            os.remove(emp.photo_path)

        db.delete(emp)
        db.commit()
        return True

    def save_photo(self, db: Session, employee_id: str, file_content: bytes, filename: str, content_type: str) -> str:
        """Save an employee profile photo. Returns the photo URL."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee '{employee_id}' not found.")

        # Validate file size
        if len(file_content) > MAX_PHOTO_SIZE:
            raise ValueError(f"Photo file too large. Maximum size is {MAX_PHOTO_SIZE // (1024*1024)} MB.")

        # Validate file type
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_PHOTO_EXTS and content_type not in ALLOWED_PHOTO_TYPES:
            raise ValueError(f"Invalid photo format. Allowed: {ALLOWED_PHOTO_EXTS}")

        # Remove old photo
        if emp.photo_path and os.path.exists(emp.photo_path):
            os.remove(emp.photo_path)

        # Save new photo with UUID filename
        safe_ext = ext if ext in ALLOWED_PHOTO_EXTS else ".jpg"
        photo_filename = f"{employee_id}_{uuid.uuid4().hex[:8]}{safe_ext}"
        photo_path = UPLOAD_DIR / photo_filename

        with open(photo_path, "wb") as f:
            f.write(file_content)

        emp.photo_path = str(photo_path)
        emp.updated_at = datetime.utcnow()
        db.commit()

        return f"/api/employees/{employee_id}/photo"

    def get_photo_path(self, db: Session, employee_id: str) -> Optional[str]:
        """Get the filesystem path for an employee's photo."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp or not emp.photo_path:
            return None
        if os.path.exists(emp.photo_path):
            return emp.photo_path
        return None

    def remove_photo(self, db: Session, employee_id: str) -> bool:
        """Remove an employee's photo."""
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not emp:
            raise ValueError(f"Employee '{employee_id}' not found.")

        if emp.photo_path and os.path.exists(emp.photo_path):
            os.remove(emp.photo_path)

        emp.photo_path = None
        emp.updated_at = datetime.utcnow()
        db.commit()
        return True

    def get_dashboard_stats(self, db: Session) -> DashboardStats:
        """Calculate real-time dashboard statistics from the database."""
        total = db.query(Employee).count()
        active = db.query(Employee).filter(Employee.status == "Active").count()

        # Distinct teams and departments
        teams = db.query(func.count(func.distinct(Employee.team))).scalar() or 0
        departments = db.query(func.count(func.distinct(Employee.department))).scalar() or 0

        # Distribution by department
        by_dept = (
            db.query(Employee.department, func.count(Employee.id))
            .group_by(Employee.department)
            .all()
        )
        by_department = [{"name": d[0], "count": d[1]} for d in by_dept]

        # Distribution by team
        by_tm = (
            db.query(Employee.team, func.count(Employee.id))
            .group_by(Employee.team)
            .all()
        )
        by_team = [{"name": t[0], "count": t[1]} for t in by_tm]

        # Distribution by role
        by_rl = (
            db.query(Employee.role, func.count(Employee.id))
            .group_by(Employee.role)
            .all()
        )
        by_role = [{"name": r[0], "count": r[1]} for r in by_rl]

        # Recent employees (last 5)
        recent = (
            db.query(Employee)
            .order_by(Employee.created_at.desc())
            .limit(5)
            .all()
        )
        recent_employees = [_employee_to_response(e, db) for e in recent]

        return DashboardStats(
            total_employees=total,
            active_employees=active,
            total_teams=teams,
            total_departments=departments,
            by_department=by_department,
            by_team=by_team,
            by_role=by_role,
            recent_employees=recent_employees,
        )

    def get_filter_options(self, db: Session) -> dict:
        """Get distinct values for department, team, role, and status filters."""
        departments = [r[0] for r in db.query(func.distinct(Employee.department)).order_by(Employee.department).all()]
        teams = [r[0] for r in db.query(func.distinct(Employee.team)).order_by(Employee.team).all()]
        roles = [r[0] for r in db.query(func.distinct(Employee.role)).order_by(Employee.role).all()]
        statuses = [r[0] for r in db.query(func.distinct(Employee.status)).order_by(Employee.status).all()]

        return {
            "departments": departments,
            "teams": teams,
            "roles": roles,
            "statuses": statuses,
        }

    def seed_sample_employees(self, db: Session):
        """Seed sample employee data if the table is empty."""
        if db.query(Employee).count() > 0:
            return

        sample_employees = [
            Employee(employee_id="EMP-1001", full_name="Arjun Kumar", email="arjun.kumar@company.com",
                     role="AI Software Engineer", department="Engineering", team="AI & Automation",
                     joining_date=datetime(2023, 3, 15).date(), status="Active"),
            Employee(employee_id="EMP-1002", full_name="Priya Sharma", email="priya.sharma@company.com",
                     role="Senior Data Scientist", department="Engineering", team="Data Science",
                     joining_date=datetime(2022, 8, 1).date(), status="Active"),
            Employee(employee_id="EMP-1003", full_name="Rahul Menon", email="rahul.menon@company.com",
                     role="Product Manager", department="Product", team="Core Platform",
                     joining_date=datetime(2023, 1, 10).date(), status="Active"),
            Employee(employee_id="EMP-1004", full_name="Sneha Patel", email="sneha.patel@company.com",
                     role="UX Designer", department="Design", team="Product Design",
                     joining_date=datetime(2023, 6, 20).date(), status="Active"),
            Employee(employee_id="EMP-1005", full_name="Vikram Singh", email="vikram.singh@company.com",
                     role="DevOps Engineer", department="Engineering", team="Infrastructure",
                     joining_date=datetime(2022, 11, 5).date(), status="Active"),
            Employee(employee_id="EMP-1006", full_name="Ananya Reddy", email="ananya.reddy@company.com",
                     role="HR Business Partner", department="Human Resources", team="HR Operations",
                     joining_date=datetime(2022, 4, 1).date(), status="Active"),
            Employee(employee_id="EMP-1007", full_name="Karthik Nair", email="karthik.nair@company.com",
                     role="Backend Developer", department="Engineering", team="AI & Automation",
                     joining_date=datetime(2023, 9, 12).date(), status="Active"),
            Employee(employee_id="EMP-1008", full_name="Meera Iyer", email="meera.iyer@company.com",
                     role="QA Lead", department="Engineering", team="Quality Assurance",
                     joining_date=datetime(2022, 7, 15).date(), status="On Leave"),
            Employee(employee_id="EMP-1009", full_name="Aditya Joshi", email="aditya.joshi@company.com",
                     role="Marketing Manager", department="Marketing", team="Digital Marketing",
                     joining_date=datetime(2023, 2, 28).date(), status="Active"),
            Employee(employee_id="EMP-1010", full_name="Divya Krishnan", email="divya.krishnan@company.com",
                     role="Finance Analyst", department="Finance", team="Financial Planning",
                     joining_date=datetime(2023, 5, 1).date(), status="Active"),
            Employee(employee_id="EMP-1011", full_name="Rohan Gupta", email="rohan.gupta@company.com",
                     role="Frontend Developer", department="Engineering", team="Web Platform",
                     joining_date=datetime(2024, 1, 8).date(), status="Active"),
            Employee(employee_id="EMP-1012", full_name="Lakshmi Venkatesh", email="lakshmi.v@company.com",
                     role="Recruitment Specialist", department="Human Resources", team="Talent Acquisition",
                     joining_date=datetime(2023, 4, 18).date(), status="Active"),
        ]

        # Set manager relationships
        for emp in sample_employees:
            db.add(emp)
        db.commit()

        # Set Arjun Kumar (EMP-1001) as manager for some engineering folks
        arjun = db.query(Employee).filter(Employee.employee_id == "EMP-1001").first()
        if arjun:
            for eid in ["EMP-1007", "EMP-1011"]:
                sub = db.query(Employee).filter(Employee.employee_id == eid).first()
                if sub:
                    sub.manager_id = arjun.id

        # Set Ananya Reddy (EMP-1006) as manager for HR folks
        ananya = db.query(Employee).filter(Employee.employee_id == "EMP-1006").first()
        if ananya:
            lakshmi = db.query(Employee).filter(Employee.employee_id == "EMP-1012").first()
            if lakshmi:
                lakshmi.manager_id = ananya.id

        db.commit()
