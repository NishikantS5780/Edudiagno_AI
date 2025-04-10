from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app import database, schemas
from app.models import Interview

router = APIRouter()


@router.get("")
async def get_interview(
    request: Request, id: str, db: Session = Depends(database.get_db)
):
    stmt = select(Interview).where(Interview.id == int(id))
    result = db.execute(stmt)
    interview = result.scalars().all()[0]
    return interview


@router.post("")
async def create_interview(
    request: Request,
    interview_data: schemas.CreateInterview,
    db: Session = Depends(database.get_db),
):
    interview = Interview(
        first_name=interview_data.first_name,
        last_name=interview_data.last_name,
        email=interview_data.email,
        phone=interview_data.phone,
        work_experience=interview_data.work_experience,
        education=interview_data.education,
        skills=interview_data.skills,
        location=interview_data.location,
        linkedin_url=interview_data.linkedin_url,
        portfolio_url=interview_data.portfolio_url,
        resume_url=interview_data.resume_url,
        resume_text=interview_data.resume_text,
        resume_match_score=interview_data.resume_match_score,
        resume_match_feedback=interview_data.resume_match_feedback,
        overall_score=interview_data.overall_score,
        feedback=interview_data.feedback,
        job_id=interview_data.job_id,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.put("")
async def update_interview(
    request: Request,
    interview_data: schemas.UpdateInterview,
    db: Session = Depends(database.get_db),
):
    stmt = (
        update(Interview)
        .where(Interview.id == interview_data.id)
        .values(
            work_experience=interview_data.work_experience,
            education=interview_data.education,
            skills=interview_data.skills,
            location=interview_data.location,
            linkedin_url=interview_data.linkedin_url,
            portfolio_url=interview_data.portfolio_url,
            resume_url=interview_data.resume_url,
            resume_text=interview_data.resume_text,
            resume_match_score=interview_data.resume_match_score,
            resume_match_feedback=interview_data.resume_match_feedback,
            overall_score=interview_data.overall_score,
            feedback=interview_data.feedback,
        )
        .returning(Interview)
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]
    return interview
