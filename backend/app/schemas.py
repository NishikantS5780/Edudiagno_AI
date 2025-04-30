from typing import Optional
from pydantic import BaseModel


class RecruiterRegistration(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    designation: str
    company_name: str
    industry: str
    country: str
    state: str
    city: str
    zip: str
    address: str


class RecruiterLogin(BaseModel):
    email: str
    password: str


class Recruiter(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    designation: Optional[str]
    company_name: Optional[str]
    company_logo: Optional[str]
    website: Optional[str]
    industry: Optional[str]
    min_company_size: Optional[int]
    max_company_size: Optional[int]
    country: Optional[str]
    state: Optional[str]
    city: Optional[str]
    zip: Optional[str]
    address: Optional[str]


class RecruiterSendEmailOtp(BaseModel):
    email: str


class RecruiterVerifyEmailOtp(BaseModel):
    email: str
    otp: str


class CreateJob(BaseModel):
    title: str
    description: str
    department: str
    city: str
    location: str
    type: str
    min_experience: int
    max_experience: int
    salary_min: int
    salary_max: int
    show_salary: Optional[bool] = True
    requirements: str
    benefits: str
    status: str


class Job(BaseModel):
    id: int
    title: str
    description: str
    department: str
    location: str
    type: str
    min_experience: int
    max_experience: int
    salary_min: int
    salary_max: int
    show_salary: bool
    requirements: str
    benefits: str
    status: str
    company_id: int


class CreateInterview(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    work_experience: int
    education: str
    skills: str
    location: str
    linkedin_url: str
    portfolio_url: str
    resume_text: str
    job_id: int


class UpdateInterview(BaseModel):
    id: int
    work_experience: int
    education: str
    skills: str
    location: str
    linkedin_url: str
    portfolio_url: str
    resume_url: str
    resume_text: str
    resume_match_score: int
    resume_match_feedback: str
    overall_score: int
    feedback: str


class TextToSpeech(BaseModel):
    text: str


class GenerateJobDescription(BaseModel):
    title: str
    department: str
    location: str


class GenerateJobRequirement(BaseModel):
    title: str
    department: str
    location: str
    keywords: str


class UpdateInterviewQuestionResponse(BaseModel):
    question_order: int
    answer: str


class CreateDSAQuestion(BaseModel):
    title: str
    description: str
    difficulty: str
    job_id: int


class UpdateDSAQuestion(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None


class CreateDSATestCase(BaseModel):
    input: str
    expected_output: str
    dsa_question_id: int


class UpdateDSATestCase(BaseModel):
    input: Optional[str] = None
    expected_output: Optional[str] = None
    id: int


class CreateDSAResponse(BaseModel):
    code: str
    question_id: int


class UpdateDSAResponse(BaseModel):
    code: str
    id: int


class CreateQuizQuestion(BaseModel):
    description: str
    type: str
    job_id: int


class UpdateQuizQuestion(BaseModel):
    description: str
    type: str
    id: int


class CreateQuizOption(BaseModel):
    label: str
    correct: bool
    question_id: int


class UpdateQuizOption(BaseModel):
    label: str
    correct: bool
    id: int


class CreateQuizResponse(BaseModel):
    question_id: int
    option_id: int
