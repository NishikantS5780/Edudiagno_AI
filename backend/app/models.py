from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
    UniqueConstraint,
)
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
    verified = Column(Boolean)
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
    city = Column(String)
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
    interviews = relationship("Interview", back_populates="job", cascade="all, delete")
    quiz_questions = relationship(
        "QuizQuestion", back_populates="job", cascade="all, delete"
    )
    dsa_questions = relationship(
        "DSAQuestion", back_populates="job", cascade="all, delete"
    )


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True)
    description = Column(String)
    created_at = Column(DateTime, default=func.now())
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="quiz_questions")
    options = relationship(
        "QuizOption", back_populates="question", cascade="all, delete"
    )
    responses = relationship(
        "QuizResponse", back_populates="question", cascade="all, delete"
    )


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id = Column(Integer, primary_key=True)
    label = Column(String)
    correct = Column(Boolean, default=False)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"))

    question = relationship("QuizQuestion", back_populates="options")
    responses = relationship(
        "QuizResponse", back_populates="option", cascade="all, delete"
    )


class DSAQuestion(Base):
    __tablename__ = "dsa_questions"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    difficulty = Column(String)
    created_at = Column(DateTime, default=func.now())
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="dsa_questions")
    test_cases = relationship(
        "DSATestCase", back_populates="question", cascade="all, delete"
    )
    responses = relationship(
        "DSAResponse", back_populates="question", cascade="all, delete"
    )


class DSATestCase(Base):
    __tablename__ = "dsa_test_cases"

    id = Column(Integer, primary_key=True)
    input = Column(String)
    expected_output = Column(String)
    dsa_question_id = Column(Integer, ForeignKey("dsa_questions.id"))

    question = relationship("DSAQuestion", back_populates="test_cases")
    responses = relationship(
        "DSATestCaseResponse", back_populates="test_case", cascade="all, delete"
    )


class Interview(Base):
    __tablename__ = "interviews"
    __table_args__ = (UniqueConstraint("email", "job_id", name="uq_email_job"),)

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
    technical_skills_score = Column(Integer)
    communication_skills_score = Column(Integer)
    problem_solving_skills_score = Column(Integer)
    cultural_fit_score = Column(Integer)
    feedback = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    job = relationship("Job", back_populates="interviews")
    question_and_responses = relationship(
        "InterviewQuestionAndResponse",
        back_populates="interview",
        cascade="all, delete",
    )
    quiz_responses = relationship(
        "QuizResponse", back_populates="interview", cascade="all, delete"
    )
    dsa_responses = relationship(
        "DSAResponse", back_populates="interview", cascade="all, delete"
    )


class InterviewQuestionAndResponse(Base):
    __tablename__ = "interview_question_and_responses"

    question = Column(String, nullable=False)
    question_type = Column(
        String, nullable=False
    )  # technical, behavioral, problem_solving, custom
    order_number = Column(Integer, primary_key=True)
    answer = Column(String)
    created_at = Column(DateTime, default=func.now())
    interview_id = Column(
        Integer, ForeignKey("interviews.id"), primary_key=True, nullable=False
    )

    # Relationships
    interview = relationship("Interview", back_populates="question_and_responses")


class DSAResponse(Base):
    __tablename__ = "dsa_responses"

    id = Column(Integer, primary_key=True)
    code = Column(String)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    question_id = Column(Integer, ForeignKey("dsa_questions.id"))

    interview = relationship("Interview", back_populates="dsa_responses")
    question = relationship("DSAQuestion", back_populates="responses")
    test_case_responses = relationship(
        "DSATestCaseResponse", back_populates="interview_dsa_response"
    )

    _table_args__ = UniqueConstraint(
        "interview_id", "question_id", name="uq_interview_and_question"
    )


class DSATestCaseResponse(Base):
    __tablename__ = "dsa_test_case_responses"

    status = Column(String)
    dsa_response_id = Column(Integer, ForeignKey("dsa_responses.id"), primary_key=True)
    task_id = Column(String)
    dsa_test_case_id = Column(
        Integer, ForeignKey("dsa_test_cases.id"), primary_key=True
    )

    interview_dsa_response = relationship(
        "DSAResponse", back_populates="test_case_responses", cascade="all, delete"
    )
    test_case = relationship("DSATestCase", back_populates="responses")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    interview_id = Column(Integer, ForeignKey("interviews.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), primary_key=True)
    option_id = Column(Integer, ForeignKey("quiz_options.id"))

    interview = relationship("Interview", back_populates="quiz_responses")
    question = relationship("QuizQuestion", back_populates="responses")
    option = relationship("QuizOption", back_populates="responses")
