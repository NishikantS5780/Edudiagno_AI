from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InterviewQuestionBase(BaseModel):
    question: str
    order_number: Optional[int] = None
    time_allocation: Optional[int] = 180  # default 3 minutes

class InterviewQuestionCreate(InterviewQuestionBase):
    pass

class InterviewQuestionResponse(InterviewQuestionBase):
    id: int
    interview_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class InterviewResponseBase(BaseModel):
    video_url: Optional[str] = None
    transcript: Optional[str] = None
    score: Optional[int] = None
    ai_feedback: Optional[str] = None

class InterviewResponseCreate(InterviewResponseBase):
    pass

class InterviewResponseUpdate(InterviewResponseBase):
    pass

class InterviewResponseInDB(InterviewResponseBase):
    id: int
    question_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class InterviewBase(BaseModel):
    job_id: int
    candidate_id: int
    scheduled_at: Optional[datetime] = None

class InterviewCreate(InterviewBase):
    questions: Optional[List[InterviewQuestionCreate]] = None

class InterviewUpdate(BaseModel):
    status: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class InterviewInDB(InterviewBase):
    id: int
    status: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class CompanyData(BaseModel):
    company_name: Optional[str]
    company_logo: Optional[str]

class JobData(BaseModel):
    title: Optional[str]
    company: Optional[CompanyData]

class InterviewResponse(InterviewBase):
    id: int
    status: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    access_code: str
    questions: List[InterviewQuestionResponse] = []
    job: Optional[JobData] = None
    
    class Config:
        orm_mode = True

class GenerateQuestionsRequest(BaseModel):
    job_id: int
    resume_text: Optional[str] = None
    question_types: List[str] = ["technical", "behavioral", "problemSolving"]
    count: int = 5
