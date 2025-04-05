from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import random
import string

from database import get_db
from schemas.interviews import (
    InterviewCreate, InterviewResponse, InterviewUpdate,
    InterviewQuestionCreate, InterviewQuestionResponse,
    GenerateQuestionsRequest, PublicInterviewLinkCreate, PublicInterviewLinkResponse
)
from models.models import User, Interview, InterviewQuestion, Candidate, Job, PublicInterviewLink
from utils.auth import get_current_user
from utils.openai_utils import generate_interview_questions

router = APIRouter()

# Utility function to generate a random access code
def generate_access_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def format_compensation(job):
    # Debug logging
    print("Compensation data:", {
        "show_salary": job.show_salary,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max
    })
    
    if not job.show_salary:
        return "Not specified"
    if job.salary_min and job.salary_max:
        return f"${job.salary_min:,} - ${job.salary_max:,}"
    elif job.salary_min:
        return f"From ${job.salary_min:,}"
    elif job.salary_max:
        return f"Up to ${job.salary_max:,}"
    return "Not specified"

def format_job_details(job):
    # Debug logging
    print("Job data:", {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "show_salary": job.show_salary
    })
    
    return {
        "id": job.id,
        "title": job.title,
        "company": {
            "id": job.company.id,
            "name": job.company.company_name,
            "logo": job.company.company_logo
        },
        "location": job.location or "Not specified",
        "type": job.type or "Not specified",
        "description": job.description or "No description available",
        "requirements": job.requirements or "No specific requirements listed",
        "benefits": job.benefits or "No benefits listed",
        "compensation": format_compensation(job),
        "created_at": job.created_at
    }

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
    try:
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
            max_questions=request.count
        )

        if not questions or len(questions) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate questions"
            )
        
        return {"questions": questions}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview questions"
        )

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
    """Get interview by access code"""
    interview = db.query(Interview).filter(Interview.access_code == access_code).first()
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Format the response to include candidate data
    response = {
        **interview.__dict__,
        "candidate": {
            "id": interview.candidate.id,
            "first_name": interview.candidate.first_name,
            "last_name": interview.candidate.last_name,
            "email": interview.candidate.email,
            "resume_text": interview.candidate.resume_text,
            "work_experience": interview.candidate.work_experience,
            "education": interview.candidate.education,
            "skills": interview.candidate.skills
        }
    }
    
    return response

@router.post("/public/{job_id}", response_model=PublicInterviewLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_public_link(
    job_id: int,
    data: PublicInterviewLinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new public interview link"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get company details
    company = db.query(User).filter(User.id == job.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Generate access code
    access_code = generate_access_code()
    
    # Create public link
    db_link = PublicInterviewLink(
        job_id=job_id,
        name=data.name,
        access_code=access_code,
        is_active=data.is_active,
        expires_at=datetime.utcnow() + timedelta(days=data.expiration) if data.expiration else None
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    
    # Format response with job details
    return {
        "id": db_link.id,
        "job_id": db_link.job_id,
        "name": db_link.name,
        "access_code": db_link.access_code,
        "is_active": db_link.is_active,
        "expires_at": db_link.expires_at,
        "visits": db_link.visits,
        "started_interviews": db_link.started_interviews,
        "completed_interviews": db_link.completed_interviews,
        "created_at": db_link.created_at,
        "updated_at": db_link.updated_at,
        "job": format_job_details(job)
    }

@router.get("/public/{job_id}", response_model=List[PublicInterviewLinkResponse])
async def get_public_links(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all public interview links for a job"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get company details
    company = db.query(User).filter(User.id == job.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Get links with job details
    links = db.query(PublicInterviewLink).filter(PublicInterviewLink.job_id == job_id).all()
    
    # Format response with job details
    formatted_links = []
    for link in links:
        formatted_links.append({
            "id": link.id,
            "job_id": link.job_id,
            "name": link.name,
            "access_code": link.access_code,
            "is_active": link.is_active,
            "expires_at": link.expires_at,
            "visits": link.visits,
            "started_interviews": link.started_interviews,
            "completed_interviews": link.completed_interviews,
            "created_at": link.created_at,
            "updated_at": link.updated_at,
            "job": format_job_details(job)
        })
    
    return formatted_links

@router.delete("/public/{job_id}/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_public_link(
    job_id: int,
    link_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a public interview link"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    link = db.query(PublicInterviewLink).filter(
        PublicInterviewLink.id == link_id,
        PublicInterviewLink.job_id == job_id
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    db.delete(link)
    db.commit()
    return {"detail": "Link deleted"}

@router.patch("/public/{job_id}/{link_id}", response_model=PublicInterviewLinkResponse)
async def toggle_public_link_status(
    job_id: int,
    link_id: int,
    is_active: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a public interview link's active status"""
    # Verify job belongs to user
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get company details
    company = db.query(User).filter(User.id == job.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    link = db.query(PublicInterviewLink).filter(
        PublicInterviewLink.id == link_id,
        PublicInterviewLink.job_id == job_id
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    link.is_active = is_active
    db.commit()
    db.refresh(link)
    
    # Format response with job details
    return {
        "id": link.id,
        "job_id": link.job_id,
        "name": link.name,
        "access_code": link.access_code,
        "is_active": link.is_active,
        "expires_at": link.expires_at,
        "visits": link.visits,
        "started_interviews": link.started_interviews,
        "completed_interviews": link.completed_interviews,
        "created_at": link.created_at,
        "updated_at": link.updated_at,
        "job": format_job_details(job)
    }

@router.get("/public/access/{access_code}", response_model=PublicInterviewLinkResponse)
async def get_public_link_by_access_code(
    access_code: str,
    db: Session = Depends(get_db)
):
    """Get a public interview link by access code"""
    link = db.query(PublicInterviewLink).filter(
        PublicInterviewLink.access_code == access_code
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Check if link is active
    if not link.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link is inactive"
        )
    
    # Check if link has expired
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link has expired"
        )
    
    # Get job details with all fields
    job = db.query(Job).filter(Job.id == link.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Debug: Print all job fields
    print("Job fields:", {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "show_salary": job.show_salary,
        "location": job.location,
        "type": job.type
    })
    
    # Get company details
    company = db.query(User).filter(User.id == job.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Increment visits
    link.visits += 1
    db.commit()
    
    # Format the response according to the schema
    return {
        "id": link.id,
        "job_id": link.job_id,
        "name": link.name,
        "access_code": link.access_code,
        "is_active": link.is_active,
        "expires_at": link.expires_at,
        "visits": link.visits,
        "started_interviews": link.started_interviews,
        "completed_interviews": link.completed_interviews,
        "created_at": link.created_at,
        "updated_at": link.updated_at,
        "job": format_job_details(job)
    }
