
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: Optional[bool] = True
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    published: Optional[bool] = True

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: Optional[bool] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    published: Optional[bool] = None
    status: Optional[str] = None

class JobInDB(JobBase):
    id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class JobResponse(JobBase):
    id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Interview Settings
class CustomQuestion(BaseModel):
    question: str
    order: Optional[int] = None

class InterviewSettingsBase(BaseModel):
    job_id: int
    include_technical: bool = True
    include_behavioral: bool = True
    include_problem_solving: bool = True
    include_custom_questions: bool = False
    custom_questions: Optional[List[CustomQuestion]] = []
    preparation_time: Optional[int] = 60

class InterviewSettingsCreate(InterviewSettingsBase):
    pass

class InterviewSettingsUpdate(BaseModel):
    include_technical: Optional[bool] = None
    include_behavioral: Optional[bool] = None
    include_problem_solving: Optional[bool] = None
    include_custom_questions: Optional[bool] = None
    custom_questions: Optional[List[CustomQuestion]] = None
    preparation_time: Optional[int] = None

class InterviewSettingsResponse(InterviewSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Public Job View
class PublicJobResponse(BaseModel):
    id: int
    title: str
    company_name: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: bool
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
