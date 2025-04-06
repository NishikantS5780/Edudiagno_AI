from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from schemas.jobs import (
    JobCreate, JobResponse, JobUpdate, 
    InterviewSettingsCreate, InterviewSettingsResponse, InterviewSettingsUpdate,
    PublicJobResponse
)
from models.models import (
    User, Job, Interview, Candidate, 
    VideoResponse, InterviewQuestion, 
    PublicInterviewLink, InterviewSettings
)
from utils.auth import get_current_user
from utils.openai_utils import generate_job_description, generate_interview_questions, generate_job_requirements, generate_job_benefits

router = APIRouter()

# Job CRUD operations
@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job"""
    db_job = Job(
        title=job.title,
        description=job.description,
        department=job.department,
        location=job.location,
        type=job.type,
        experience=job.experience,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        show_salary=job.show_salary,
        requirements=job.requirements,
        benefits=job.benefits,
        company_id=current_user.id,
        status="active" if job.published else "draft"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("", response_model=List[JobResponse])
async def get_jobs(
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all jobs for the current user's company"""
    query = db.query(Job).filter(Job.company_id == current_user.id)
    
    if status:
        query = query.filter(Job.status == status)
    if department:
        query = query.filter(Job.department == department)
    
    jobs = query.all()
    return jobs

@router.get("/public", response_model=List[PublicJobResponse])
async def get_public_jobs(
    company_id: Optional[int] = Query(None),
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all published jobs (public endpoint)"""
    query = db.query(Job).join(User).filter(Job.status == "active")
    
    if company_id:
        query = query.filter(Job.company_id == company_id)
    if department:
        query = query.filter(Job.department == department)
    if location:
        query = query.filter(Job.location == location)
    
    jobs = query.all()
    
    # Convert to PublicJobResponse format
    result = []
    for job in jobs:
        company = db.query(User).filter(User.id == job.company_id).first()
        company_name = company.company_name if company else "Unknown Company"
        
        result.append({
            "id": job.id,
            "title": job.title,
            "company_name": company_name,
            "department": job.department,
            "location": job.location,
            "type": job.type,
            "experience": job.experience,
            "salary_min": job.salary_min if job.show_salary else None,
            "salary_max": job.salary_max if job.show_salary else None,
            "show_salary": job.show_salary,
            "description": job.description,
            "requirements": job.requirements,
            "benefits": job.benefits,
            "created_at": job.created_at
        })
    
    return result

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific job by ID"""
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@router.get("/public/{job_id}", response_model=PublicJobResponse)
async def get_public_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific job by ID (public endpoint)"""
    job = db.query(Job).filter(Job.id == job_id, Job.status == "active").first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    company = db.query(User).filter(User.id == job.company_id).first()
    company_name = company.company_name if company else "Unknown Company"
    
    result = {
        "id": job.id,
        "title": job.title,
        "company_name": company_name,
        "department": job.department,
        "location": job.location,
        "type": job.type,
        "experience": job.experience,
        "salary_min": job.salary_min if job.show_salary else None,
        "salary_max": job.salary_max if job.show_salary else None,
        "show_salary": job.show_salary,
        "description": job.description,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "created_at": job.created_at
    }
    
    return result

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job"""
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update job fields
    if job_update.title is not None:
        job.title = job_update.title
    if job_update.description is not None:
        job.description = job_update.description
    if job_update.department is not None:
        job.department = job_update.department
    if job_update.location is not None:
        job.location = job_update.location
    if job_update.type is not None:
        job.type = job_update.type
    if job_update.experience is not None:
        job.experience = job_update.experience
    if job_update.salary_min is not None:
        job.salary_min = job_update.salary_min
    if job_update.salary_max is not None:
        job.salary_max = job_update.salary_max
    if job_update.show_salary is not None:
        job.show_salary = job_update.show_salary
    if job_update.requirements is not None:
        job.requirements = job_update.requirements
    if job_update.benefits is not None:
        job.benefits = job_update.benefits
    if job_update.published is not None:
        job.status = "active" if job_update.published else "draft"
    if job_update.status is not None:
        job.status = job_update.status
    
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job"""
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        # Delete video responses first (deepest in the relationship tree)
        db.query(VideoResponse).filter(
            VideoResponse.interview_id.in_(
                db.query(Interview.id).filter(Interview.job_id == job_id)
            )
        ).delete(synchronize_session=False)
        
        # Delete interview questions
        db.query(InterviewQuestion).filter(
            InterviewQuestion.interview_id.in_(
                db.query(Interview.id).filter(Interview.job_id == job_id)
            )
        ).delete(synchronize_session=False)
        
        # Delete interviews
        db.query(Interview).filter(Interview.job_id == job_id).delete(synchronize_session=False)
        
        # Delete candidates
        db.query(Candidate).filter(Candidate.job_id == job_id).delete(synchronize_session=False)
        
        # Delete interview settings
        db.query(InterviewSettings).filter(InterviewSettings.job_id == job_id).delete(synchronize_session=False)
        
        # Delete public interview links
        db.query(PublicInterviewLink).filter(PublicInterviewLink.job_id == job_id).delete(synchronize_session=False)
        
        # Finally, delete the job
        db.delete(job)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )

# Job Interview Settings
@router.post("/{job_id}/interview-settings", response_model=InterviewSettingsResponse)
async def create_interview_settings(
    job_id: int,
    settings: InterviewSettingsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update interview settings for a job"""
    # Check if job exists and belongs to current user
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if settings already exist
    existing_settings = db.query(InterviewSettings).filter(InterviewSettings.job_id == job_id).first()
    
    if existing_settings:
        # Update existing settings
        if settings.include_technical is not None:
            existing_settings.include_technical = settings.include_technical
        if settings.include_behavioral is not None:
            existing_settings.include_behavioral = settings.include_behavioral
        if settings.include_problem_solving is not None:
            existing_settings.include_problem_solving = settings.include_problem_solving
        if settings.include_custom_questions is not None:
            existing_settings.include_custom_questions = settings.include_custom_questions
        if settings.custom_questions is not None:
            existing_settings.custom_questions = settings.custom_questions
        if settings.preparation_time is not None:
            existing_settings.preparation_time = settings.preparation_time
        
        existing_settings.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_settings)
        return existing_settings
    else:
        # Create new settings
        db_settings = InterviewSettings(
            job_id=job_id,
            include_technical=settings.include_technical,
            include_behavioral=settings.include_behavioral,
            include_problem_solving=settings.include_problem_solving,
            include_custom_questions=settings.include_custom_questions,
            custom_questions=settings.custom_questions,
            preparation_time=settings.preparation_time
        )
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
        return db_settings

@router.get("/{job_id}/interview-settings", response_model=InterviewSettingsResponse)
async def get_interview_settings(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview settings for a job"""
    # Check if job exists and belongs to current user
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get settings
    settings = db.query(InterviewSettings).filter(InterviewSettings.job_id == job_id).first()
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview settings not found"
        )
    
    return settings

@router.put("/{job_id}/interview-settings", response_model=InterviewSettingsResponse)
async def update_interview_settings(
    job_id: int,
    settings_update: InterviewSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update interview settings for a job"""
    # Check if job exists and belongs to current user
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get settings
    settings = db.query(InterviewSettings).filter(InterviewSettings.job_id == job_id).first()
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview settings not found"
        )
    
    # Update settings
    if settings_update.include_technical is not None:
        settings.include_technical = settings_update.include_technical
    if settings_update.include_behavioral is not None:
        settings.include_behavioral = settings_update.include_behavioral
    if settings_update.include_problem_solving is not None:
        settings.include_problem_solving = settings_update.include_problem_solving
    if settings_update.include_custom_questions is not None:
        settings.include_custom_questions = settings_update.include_custom_questions
    if settings_update.custom_questions is not None:
        settings.custom_questions = settings_update.custom_questions
    if settings_update.preparation_time is not None:
        settings.preparation_time = settings_update.preparation_time
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    return settings

# Job sharing and invitation
@router.post("/{job_id}/share")
async def share_job(
    job_id: int,
    emails: List[str] = Body(...),
    custom_message: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share a job posting via email"""
    # Check if job exists and belongs to current user
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # In a real implementation, this would send emails
    # For now, we'll just return a success message
    return {
        "success": True,
        "message": f"Job '{job.title}' shared with {len(emails)} recipients",
        "recipients": emails
    }

@router.post("/generate-description")
async def generate_job_description_api(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Generate a job description using AI"""
    description = await generate_job_description(data["title"], data["department"], data["location"])
    return {"description": description}

@router.get("/{job_id}/stats")
async def get_job_stats(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for a job"""
    # Check if job exists and belongs to current user
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get count of candidates by status
    candidates_query = db.query(Candidate).filter(Candidate.job_id == job_id)
    total_candidates = candidates_query.count()
    new_candidates = candidates_query.filter(Candidate.status == "new").count()
    reviewing_candidates = candidates_query.filter(Candidate.status == "reviewing").count()
    interviewing_candidates = candidates_query.filter(Candidate.status == "interviewing").count()
    hired_candidates = candidates_query.filter(Candidate.status == "hired").count()
    rejected_candidates = candidates_query.filter(Candidate.status == "rejected").count()
    
    # Get count of interviews by status
    interviews_query = db.query(Interview).filter(Interview.job_id == job_id)
    total_interviews = interviews_query.count()
    pending_interviews = interviews_query.filter(Interview.status == "pending").count()
    completed_interviews = interviews_query.filter(Interview.status == "completed").count()
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "created_at": job.created_at,
        "candidates": {
            "total": total_candidates,
            "new": new_candidates,
            "reviewing": reviewing_candidates,
            "interviewing": interviewing_candidates,
            "hired": hired_candidates,
            "rejected": rejected_candidates
        },
        "interviews": {
            "total": total_interviews,
            "pending": pending_interviews,
            "completed": completed_interviews
        }
    }

@router.post("/generate-requirements")
async def generate_job_requirements_api(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Generate job requirements using AI"""
    requirements = await generate_job_requirements(
        data["title"], 
        data["department"], 
        data["location"], 
        data.get("keywords", "")
    )
    return {"requirements": requirements}

@router.post("/generate-benefits")
async def generate_job_benefits_api(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Generate job benefits using AI"""
    benefits = await generate_job_benefits(
        data["title"], 
        data["department"], 
        data["location"], 
        data.get("keywords", "")
    )
    return {"benefits": benefits}
