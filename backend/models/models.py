
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    company_name = Column(String)
    company_logo = Column(String)
    phone = Column(String)
    website = Column(String)
    industry = Column(String)
    company_size = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="company")
    candidates = relationship("Candidate", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    department = Column(String)
    location = Column(String)
    type = Column(String)  # full-time, part-time, contract, etc.
    experience = Column(String)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    show_salary = Column(Boolean, default=True)
    requirements = Column(Text)
    benefits = Column(Text)
    status = Column(String, default="active")  # active, closed, draft
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job")
    interviews = relationship("Interview", back_populates="job")
    settings = relationship("InterviewSettings", back_populates="job", uselist=False)

class InterviewSettings(Base):
    __tablename__ = "interview_settings"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    include_technical = Column(Boolean, default=True)
    include_behavioral = Column(Boolean, default=True)
    include_problem_solving = Column(Boolean, default=True)
    include_custom_questions = Column(Boolean, default=False)
    custom_questions = Column(JSON)
    preparation_time = Column(Integer, default=60)  # in seconds
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="settings")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    resume_url = Column(String)
    resume_text = Column(Text)
    resume_match_score = Column(Float)
    resume_match_feedback = Column(Text)
    status = Column(String, default="new")  # new, reviewing, interviewing, hired, rejected
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("User", back_populates="candidates")
    job = relationship("Job", back_populates="candidates")
    interviews = relationship("Interview", back_populates="candidate")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    status = Column(String, default="pending")  # pending, completed, cancelled
    access_code = Column(String, unique=True, index=True, nullable=False)
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    overall_score = Column(Float)
    feedback = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="interviews")
    candidate = relationship("Candidate", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")
    video_responses = relationship("VideoResponse", back_populates="interview", cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # technical, behavioral, problem_solving, custom
    order_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    video_response = relationship("VideoResponse", back_populates="question", uselist=False)

class VideoResponse(Base):
    __tablename__ = "video_responses"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False)
    video_url = Column(String)
    transcript = Column(Text)
    score = Column(Float)
    feedback = Column(Text)
    duration = Column(Integer)  # in seconds
    created_at = Column(DateTime, default=func.now())

    # Relationships
    interview = relationship("Interview", back_populates="video_responses")
    question = relationship("InterviewQuestion", back_populates="video_response")
