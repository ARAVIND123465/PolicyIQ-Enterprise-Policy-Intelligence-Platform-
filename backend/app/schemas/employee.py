"""
PolicyAI — Employee Schemas
Pydantic models for Employee API request/response validation.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, date


class EmployeeCreate(BaseModel):
    """Schema for creating a new employee."""
    employee_id: str = Field(..., min_length=1, max_length=20, description="Unique employee ID e.g. EMP-1001")
    full_name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., max_length=255, description="Official email address")
    role: str = Field(..., min_length=1, max_length=100, description="Job title / designation")
    department: str = Field(..., min_length=1, max_length=100)
    team: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    manager_id: Optional[int] = Field(None, description="ID of the manager employee record")
    joining_date: Optional[date] = None
    status: str = Field("Active", description="Active, On Leave, or Inactive")


class EmployeeUpdate(BaseModel):
    """Schema for updating an employee — all fields optional."""
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    team: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    manager_id: Optional[int] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None


class EmployeeResponse(BaseModel):
    """Schema for employee data returned to the client."""
    id: int
    employee_id: str
    full_name: str
    email: str
    photo_url: Optional[str] = None
    role: str
    department: str
    team: str
    phone: Optional[str] = None
    manager_id: Optional[int] = None
    manager_name: Optional[str] = None
    joining_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    """Paginated list of employees."""
    employees: list[EmployeeResponse]
    total: int
    page: int
    page_size: int


class DashboardStats(BaseModel):
    """HR dashboard statistics."""
    total_employees: int
    active_employees: int
    total_teams: int
    total_departments: int
    by_department: list[dict]
    by_team: list[dict]
    by_role: list[dict]
    recent_employees: list[EmployeeResponse]
