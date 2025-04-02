
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import random
import string
from tempfile import NamedTemporaryFile
from datetime import datetime

from database import get_db
from schemas.candidates import CandidateCreate, CandidateResponse, CandidateUpdate, ResumeAnalysis
from schemas.interviews import InterviewCreate, InterviewResponse
from models.models import User, Candidate, Job, Interview, InterviewQuestion, InterviewSettings
from utils.auth import get_current_user
from utils.s3 import generate_presigned_url, generate_unique_filename, upload_file_to_s3
from utils.openai_utils import analyze_resume_match, generate_interview_questions

router = APIRouter()

# Utility function to generate a random access code
def generate_access_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    candidate: CandidateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new candidate"""
    # Verify job belongs to user if specified
    if candidate.job_id:
        job = db.query(Job).filter(
            Job.id == candidate.job_id,
            Job.company_id == current_user.id
        ).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
    
    db_candidate = Candidate(
        first_name=candidate.first_name,
        last_name=candidate.last_name,
        email=candidate.email,
        phone=candidate.phone,
        resume_url=candidate.resume_url,
        job_id=candidate.job_id,
        company_id=current_user.id
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.get("/", response_model=List[CandidateResponse])
async def get_candidates(
    status: Optional[str] = Query(None),
    job_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all candidates for the current user's company"""
    query = db.query(Candidate).filter(Candidate.company_id == current_user.id)
    
    if status:
        query = query.filter(Candidate.status == status)
    
    if job_id:
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
        query = query.filter(Candidate.job_id == job_id)
    
    candidates = query.all()
    return candidates

@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific candidate by ID"""
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return candidate

@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: int,
    candidate_update: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a candidate"""
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Update candidate fields
    if candidate_update.first_name is not None:
        candidate.first_name = candidate_update.first_name
    if candidate_update.last_name is not None:
        candidate.last_name = candidate_update.last_name
    if candidate_update.email is not None:
        candidate.email = candidate_update.email
    if candidate_update.phone is not None:
        candidate.phone = candidate_update.phone
    if candidate_update.resume_url is not None:
        candidate.resume_url = candidate_update.resume_url
    if candidate_update.status is not None:
        candidate.status = candidate_update.status
    if candidate_update.job_id is not None:
        # Verify job belongs to user
        job = db.query(Job).filter(
            Job.id == candidate_update.job_id,
            Job.company_id == current_user.id
        ).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        candidate.job_id = candidate_update.job_id
    
    db.commit()
    db.refresh(candidate)
    return candidate

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a candidate"""
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Delete associated interviews
    db.query(Interview).filter(Interview.candidate_id == candidate_id).delete()
    
    # Delete the candidate
    db.delete(candidate)
    db.commit()
    return {"detail": "Candidate deleted"}

@router.post("/resume-upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a resume file to S3"""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    try:
        file_key = generate_unique_filename("resumes", file.filename.split(".")[-1])
        file_content = await file.read()
        
        # Save the file to a temporary location
        with NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        # Upload the file to S3
        s3_url = upload_file_to_s3(temp_path, file_key)
        
        # Clean up the temporary file
        os.unlink(temp_path)
        
        return {
            "resume_url": s3_url,
            "file_name": file.filename
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.post("/resume-upload-url")
async def get_resume_upload_url(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Generate a presigned URL for uploading a resume to S3"""
    file_key = generate_unique_filename("resumes", filename.split(".")[-1])
    presigned_url = generate_presigned_url(file_key)
    return {
        "upload_url": presigned_url,
        "file_key": file_key,
        "resume_url": f"https://{os.getenv('S3_BUCKET_NAME')}.s3.amazonaws.com/{file_key}"
    }

@router.post("/{candidate_id}/analyze-resume", response_model=ResumeAnalysis)
async def analyze_candidate_resume(
    candidate_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a candidate's resume against a job description"""
    # Get candidate and job
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # For this example, we'll use mock resume text since we don't have actual PDF parsing
    resume_text = f"""
    {candidate.first_name} {candidate.last_name}
    {candidate.email}
    {candidate.phone}
    
    Professional with experience in {job.department} looking for opportunities to contribute to a growing team.
    """
    
    # Extract job requirements from the description (in a real app, you'd have a better way to structure this)
    job_requirements = job.requirements or "Requirements section from job description"
    
    # Analyze the resume
    analysis = await analyze_resume_match(resume_text, job.description, job_requirements)
    
    # Update candidate with match score and feedback
    candidate.resume_match_score = analysis.match
    candidate.resume_match_feedback = analysis.feedback
    candidate.job_id = job_id  # Associate candidate with this job
    db.commit()
    
    return analysis

@router.post("/{candidate_id}/invite-to-interview", response_model=InterviewResponse)
async def invite_candidate_to_interview(
    candidate_id: int,
    job_id: int,
    scheduled_at: Optional[datetime] = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a candidate to an interview for a specific job"""
    # Verify candidate belongs to user
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.company_id == current_user.id
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
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
    
    # Get interview settings
    interview_settings = db.query(InterviewSettings).filter(InterviewSettings.job_id == job_id).first()
    
    # Generate access code
    access_code = generate_access_code()
    
    # Create interview
    interview = Interview(
        job_id=job_id,
        candidate_id=candidate_id,
        status="pending",
        scheduled_at=scheduled_at,
        access_code=access_code
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    # Generate interview questions based on settings
    question_types = []
    if interview_settings:
        if interview_settings.include_technical:
            question_types.append("technical")
        if interview_settings.include_behavioral:
            question_types.append("behavioral")
        if interview_settings.include_problem_solving:
            question_types.append("problem_solving")
        
        # Add custom questions if enabled
        if interview_settings.include_custom_questions and interview_settings.custom_questions:
            for i, custom_q in enumerate(interview_settings.custom_questions):
                db_question = InterviewQuestion(
                    interview_id=interview.id,
                    question=custom_q.get("question", ""),
                    question_type="custom",
                    order_number=i + 1
                )
                db.add(db_question)
    else:
        # Default to all question types if no settings
        question_types = ["technical", "behavioral", "problem_solving"]
    
    # Generate AI questions if needed
    if question_types:
        # Get resume text (mock for now)
        resume_text = f"{candidate.first_name} {candidate.last_name} - Professional with experience in {job.department}"
        
        # Generate questions with AI
        questions = await generate_interview_questions(
            job_title=job.title,
            job_description=job.description,
            resume_text=resume_text,
            question_types=question_types,
            count=5  # Generate 5 questions by default
        )
        
        # Add questions to the interview
        start_order = db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id == interview.id
        ).count() + 1
        
        for i, question in enumerate(questions):
            db_question = InterviewQuestion(
                interview_id=interview.id,
                question=question.get("question", ""),
                question_type=question.get("type", "general"),
                order_number=start_order + i
            )
            db.add(db_question)
    
    db.commit()
    
    # Update candidate status
    candidate.status = "interviewing"
    db.commit()
    
    # Create an interview URL that can be shared with the candidate
    base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    interview_url = f"{base_url}/interview/{access_code}"
    
    # In a real app, send an email to the candidate with the interview link
    
    return {
        "id": interview.id,
        "job_id": job_id,
        "candidate_id": candidate_id,
        "status": interview.status,
        "access_code": access_code,
        "interview_url": interview_url,
        "scheduled_at": scheduled_at,
        "created_at": interview.created_at,
        "updated_at": interview.updated_at
    }
