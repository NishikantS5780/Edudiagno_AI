from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from .database import Base

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    designation = Column(String)
    company_name = Column(String)
    company_logo = Column(String)
    website = Column(String)
    industry = Column(String)
    min_company_size = Column(Integer)
    max_company_size = Column(Integer)
    country = Column(String, default="United States")
    state = Column(String)
    city = Column(String)
    zip = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    department = Column(String)
    location = Column(String)
    type = Column(String)  # full-time, part-time, contract, etc.
    min_experience = Column(Integer)
    max_experience = Column(Integer)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    show_salary = Column(Boolean, default=True)
    requirements = Column(String)
    benefits = Column(String)
    status = Column(String, default="active")  # active, closed, draft
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(Integer, ForeignKey("recruiters.id"), nullable=False)

    # Relationships
    company = relationship("Recruiter", back_populates="jobs")
    interviews = relationship("Interview", back_populates="job")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="pending")  # pending, completed, cancelled
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    work_experience = Column(Integer)
    education = Column(String)
    skills = Column(String)
    location = Column(String)
    linkedin_url = Column(String)
    portfolio_url = Column(String)
    resume_url = Column(String)
    resume_text = Column(String)
    resume_match_score = Column(Integer)
    resume_match_feedback = Column(String)
    overall_score = Column(Integer)
    feedback = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    # Relationships
    job = relationship("Job", back_populates="interviews")
    question_and_responses = relationship("InterviewQuestionAndResponse", back_populates="interview", cascade="all, delete-orphan")

class InterviewQuestionAndResponse(Base):
    __tablename__ = "interview_question_and_responses"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # technical, behavioral, problem_solving, custom
    order_number = Column(Integer, nullable=False)
    answer = Column(String)
    created_at = Column(DateTime, default=func.now())
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)

    # Relationships
    interview = relationship("Interview", back_populates="question_and_responses")