from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
import string

from database import get_db
from schemas.interviews import (
    InterviewCreate, InterviewResponse, InterviewUpdate,
    InterviewQuestionCreate, InterviewQuestionResponse,
    GenerateQuestionsRequest
)
from models.models import User, Interview, InterviewQuestion, Candidate, Job
from utils.auth import get_current_user
from utils.openai_utils import generate_interview_questions

router = APIRouter()

# Utility function to generate a random access code
def generate_access_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == interview.job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify candidate belongs to user
    candidate = db.query(Candidate).filter(
        Candidate.id == interview.candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Generate access code
    access_code = generate_access_code()
    
    # Create interview
    db_interview = Interview(
        job_id=interview.job_id,
        candidate_id=interview.candidate_id,
        scheduled_at=interview.scheduled_at,
        status="pending",
        access_code=access_code
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    # Add questions if provided
    if interview.questions:
        for i, question in enumerate(interview.questions):
            db_question = InterviewQuestion(
                interview_id=db_interview.id,
                question=question.question,
                order_number=question.order_number or i + 1,
                time_allocation=question.time_allocation
            )
            db.add(db_question)
        db.commit()
    
    # Fetch the interview with questions
    db_interview = db.query(Interview).filter(Interview.id == db_interview.id).first()
    
    return db_interview

@router.get("/", response_model=List[InterviewResponse])
async def get_interviews(
    status: Optional[str] = Query(None),
    job_id: Optional[int] = Query(None),
    candidate_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interviews for the current user's company"""
    query = db.query(Interview).join(Job).filter(Job.company_id == current_user.id)
    
    if status:
        query = query.filter(Interview.status == status)
    if job_id:
        query = query.filter(Interview.job_id == job_id)
    if candidate_id:
        query = query.filter(Interview.candidate_id == candidate_id)
    
    interviews = query.all()
    return interviews

@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific interview by ID"""
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: int,
    interview_update: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an interview"""
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Update interview fields
    if interview_update.status is not None:
        interview.status = interview_update.status
    if interview_update.score is not None:
        interview.score = interview_update.score
    if interview_update.feedback is not None:
        interview.feedback = interview_update.feedback
    if interview_update.scheduled_at is not None:
        interview.scheduled_at = interview_update.scheduled_at
    if interview_update.completed_at is not None:
        interview.completed_at = interview_update.completed_at
    
    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an interview"""
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Delete associated questions first
    db.query(InterviewQuestion).filter(InterviewQuestion.interview_id == interview_id).delete()
    
    # Delete the interview
    db.delete(interview)
    db.commit()
    return {"detail": "Interview deleted"}

@router.post("/{interview_id}/questions", response_model=List[InterviewQuestionResponse])
async def add_interview_questions(
    interview_id: int,
    questions: List[InterviewQuestionCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add questions to an interview"""
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Get the current highest order number
    max_order = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id
    ).count()
    
    # Add questions
    db_questions = []
    for i, question in enumerate(questions):
        db_question = InterviewQuestion(
            interview_id=interview_id,
            question=question.question,
            order_number=question.order_number or max_order + i + 1,
            time_allocation=question.time_allocation
        )
        db.add(db_question)
        db_questions.append(db_question)
    
    db.commit()
    for question in db_questions:
        db.refresh(question)
    
    return db_questions

@router.post("/generate-questions")
async def generate_interview_questions_api(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate interview questions using AI"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == request.job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Generate questions
    questions = await generate_interview_questions(
        job_title=job.title,
        job_description=job.description,
        resume_text=request.resume_text,
        question_types=request.question_types,
        count=request.count
    )
    
    return {"questions": questions}

@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: int,
    score: Optional[int] = None,
    feedback: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an interview as completed"""
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    interview.status = "completed"
    interview.completed_at = datetime.utcnow()
    if score is not None:
        interview.score = score
    if feedback is not None:
        interview.feedback = feedback
    
    db.commit()
    db.refresh(interview)
    
    return {"detail": "Interview marked as completed"}

@router.get("/{interview_id}/questions", response_model=List[InterviewQuestionResponse])
async def get_interview_questions(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions for an interview"""
    # Verify interview belongs to user's company
    interview = db.query(Interview).join(Job).filter(
        Interview.id == interview_id,
        Job.company_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id
    ).order_by(InterviewQuestion.order_number).all()
    
    return questions

@router.get("/by-access-code/{access_code}", response_model=InterviewResponse)
async def get_interview_by_access_code(
    access_code: str,
    db: Session = Depends(get_db)
):
    """Get an interview by access code"""
    interview = db.query(Interview).join(Job).join(User).filter(Interview.access_code == access_code).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    return interview
