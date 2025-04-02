
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    job_id: Optional[int] = None

class CandidateCreate(CandidateBase):
    resume_url: Optional[str] = None

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    status: Optional[str] = None
    job_id: Optional[int] = None

class CandidateInDB(CandidateBase):
    id: int
    company_id: int
    resume_url: Optional[str] = None
    resume_match_score: Optional[float] = None
    resume_match_feedback: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class CandidateResponse(CandidateBase):
    id: int
    company_id: int
    resume_url: Optional[str] = None
    resume_match_score: Optional[float] = None
    resume_match_feedback: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ResumeAnalysis(BaseModel):
    match: float
    feedback: str

class PublicCandidateInfo(BaseModel):
    first_name: str
    last_name: str
    
    class Config:
        orm_mode = True
