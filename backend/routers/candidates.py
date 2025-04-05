from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import random
import string
from tempfile import NamedTemporaryFile
from datetime import datetime
import json

from database import get_db
from schemas.candidates import CandidateCreate, CandidateResponse, CandidateUpdate, ResumeAnalysis
from schemas.interviews import InterviewCreate, InterviewResponse
from models.models import User, Candidate, Job, Interview, InterviewQuestion, InterviewSettings
from utils.auth import get_current_user
from utils.file_utils import generate_unique_filename, RESUME_DIR
from utils.openai_utils import analyze_resume_match, generate_interview_questions, extract_resume_details

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
    job_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a resume file to local storage"""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    try:
        # Generate unique filename
        file_key = generate_unique_filename("resumes", file.filename.split(".")[-1])
        file_path = os.path.join(RESUME_DIR, file_key)
        
        # Ensure the directory exists
        os.makedirs(RESUME_DIR, exist_ok=True)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract resume text and details
        resume_text = await extract_resume_details(file_path)
        resume_data = json.loads(resume_text)
        
        # Split name into first and last name
        name_parts = resume_data.get("name", "").split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Create or update candidate with resume text and details
        candidate = db.query(Candidate).filter(
            Candidate.job_id == job_id,
            Candidate.company_id == current_user.id
        ).first()
        
        if not candidate:
            candidate = Candidate(
                job_id=job_id,
                company_id=current_user.id,
                first_name=first_name,
                last_name=last_name,
                email=resume_data.get("email", ""),
                phone=resume_data.get("phone", ""),
                location=resume_data.get("location", ""),
                linkedin_url=resume_data.get("linkedin", ""),
                portfolio_url=resume_data.get("portfolio", ""),
                resume_url=file_path,
                resume_text=resume_text,
                work_experience=json.dumps(resume_data.get("work_experience", [])),
                education=json.dumps(resume_data.get("education", [])),
                skills=json.dumps(resume_data.get("skills", {})),
                status="new"
            )
            db.add(candidate)
        else:
            candidate.first_name = first_name
            candidate.last_name = last_name
            candidate.email = resume_data.get("email", "")
            candidate.phone = resume_data.get("phone", "")
            candidate.location = resume_data.get("location", "")
            candidate.linkedin_url = resume_data.get("linkedin", "")
            candidate.portfolio_url = resume_data.get("portfolio", "")
            candidate.resume_url = file_path
            candidate.resume_text = resume_text
            candidate.work_experience = json.dumps(resume_data.get("work_experience", []))
            candidate.education = json.dumps(resume_data.get("education", []))
            candidate.skills = json.dumps(resume_data.get("skills", {}))
        
        db.commit()
        db.refresh(candidate)
        
        return {
            "file_path": file_path,
            "job_id": job_id,
            "candidate_id": candidate.id,
            "resume_text": resume_text
        }
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid JSON response from AI: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading resume: {str(e)}"
        )

@router.post("/resume-upload-url")
async def get_resume_upload_url(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Generate a local file path for resume upload"""
    file_key = generate_unique_filename("resumes", filename.split(".")[-1])
    return {
        "upload_url": f"/uploads/resumes/{file_key}",
        "file_key": file_key,
        "resume_url": f"/uploads/resumes/{file_key}"
    }

@router.post("/resume/analyze")
async def analyze_resume(
    resume_url: str = Body(...),
    job_id: int = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a candidate's resume against a job description"""
    try:
        # Get job details
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )

        # Convert relative URL to absolute path
        resume_path = os.path.join(os.getcwd(), resume_url.lstrip('/'))
        
        if not os.path.exists(resume_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume file not found"
            )
        
        # Extract resume details using AI
        try:
            resume_details = await extract_resume_details(resume_path)
            resume_data = json.loads(resume_details)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid JSON response from AI: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to extract resume details: {str(e)}"
            )
        
        # Analyze resume match with job description
        try:
            match_analysis = await analyze_resume_match(
                resume_text=resume_data["resume_text"],
                job_description=job.description,
                job_requirements=job.requirements
            )
            match_data = json.loads(match_analysis)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid JSON response from AI match analysis: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to analyze resume match: {str(e)}"
            )

        # Split name into first and last name
        name_parts = resume_data.get("name", "").split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Create candidate with extracted details
        candidate_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": resume_data.get("email", ""),
            "phone": resume_data.get("phone", ""),
            "location": resume_data.get("location", ""),
            "linkedin_url": resume_data.get("linkedin", ""),
            "portfolio_url": resume_data.get("portfolio", ""),
            "resume_url": resume_url,
            "resume_text": resume_data.get("resume_text", ""),
            "work_experience": json.dumps(resume_data.get("work_experience", [])),
            "education": json.dumps(resume_data.get("education", [])),
            "skills": json.dumps(resume_data.get("skills", {})),
            "resume_match_score": match_data.get("match_score", 0),
            "resume_match_feedback": match_data.get("feedback", ""),
            "job_id": job_id,
            "company_id": current_user.id,
            "status": "new",
            "created_at": datetime.utcnow()
        }

        # Create new candidate
        db_candidate = Candidate(**candidate_data)
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)

        return {
            "candidate": {
                "id": db_candidate.id,
                "name": f"{db_candidate.first_name} {db_candidate.last_name}",
                "email": db_candidate.email,
                "phone": db_candidate.phone,
                "location": db_candidate.location,
                "linkedin_url": db_candidate.linkedin_url,
                "portfolio_url": db_candidate.portfolio_url,
                "resume_url": db_candidate.resume_url,
                "work_experience": json.loads(db_candidate.work_experience),
                "education": json.loads(db_candidate.education),
                "skills": json.loads(db_candidate.skills),
                "resume_match_score": db_candidate.resume_match_score,
                "resume_match_feedback": db_candidate.resume_match_feedback,
                "status": db_candidate.status,
                "created_at": db_candidate.created_at
            },
            "match_analysis": {
                "match_score": match_data.get("match_score", 0),
                "strengths": match_data.get("strengths", []),
                "improvements": match_data.get("improvements", []),
                "feedback": match_data.get("feedback", "")
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing resume: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume: {str(e)}"
        )

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
