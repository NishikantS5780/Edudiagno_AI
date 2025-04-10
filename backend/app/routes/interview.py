import datetime
import json
import os
import shutil
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app import database, schemas
from app.configs import openai
from app.models import Interview, Job, Recruiter
from app.utils import jwt
from app.dependencies.authorization import authorize_candidate, authorize_recruiter

router = APIRouter()


@router.get("")
async def get_interview(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(
            Interview.id,
            Interview.status,
            Interview.first_name,
            Interview.last_name,
            Interview.email,
            Interview.phone,
            Interview.work_experience,
            Interview.education,
            Interview.skills,
            Interview.location,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Job.title,
            Recruiter.company_name,
        )
        .join(Job, Interview.job_id == Job.id)
        .join(Recruiter, Job.company_id == Recruiter.id)
        .where(Interview.id == interview_id)
    )
    result = db.execute(stmt)
    interview = result.all()[0]._mapping
    return interview


@router.get("/recruiter-view/all")
async def get_interview(
    request: Request,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = select(Interview).join(Job).where(Job.company_id == recruiter_id)
    result = db.execute(stmt)
    interviews = result.scalars().all()
    return interviews


@router.post("")
async def create_interview(
    response: Response,
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
        resume_text=interview_data.resume_text,
        job_id=interview_data.job_id,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    encoded_jwt = jwt.encode(
        {
            "interview_id": interview.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(hours=3),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    return interview


@router.put("/upload-resume")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided"
        )

    file_path = os.path.join("uploads", "resume", str(interview_id))
    os.makedirs("uploads/resume", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(
            resume_url=file_path,
        )
        .returning(Interview)
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]

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


@router.post("/analyze-resume")
async def analyze_resume(
    request: Request,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(Job.description, Job.requirements, Interview.resume_text)
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).all()[0]

    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    prompt = f"""Analyze how well this resume matches the job description and requirements.
    Return ONLY a JSON object with these exact fields:
    {{
        "resume_match_score": number between 0 and 100,
        "resume_match_feedback": "Detailed feedback about the match"
    }}

    Resume Text:
    {data.resume_text}

    Job Description:
    {data.description}

    Job Requirements:
    {data.requirements}

    Important:
    - Return ONLY the JSON object, no other text
    - All fields must be present
    - match_score must be a number between 0 and 100
    - Arrays should not be empty (use empty string if no data)
    - All other values must be strings
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that analyzes resume-job matches. You must return a valid JSON object.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    match_analysis = response.choices[0].message.content
    match_data = json.loads(match_analysis)

    stmt = (
        update(Interview)
        .values(
            resume_match_score=int(match_data["resume_match_score"]),
            resume_match_feedback=match_data["resume_match_feedback"],
        )
        .returning(Interview)
    )

    interview = db.execute(stmt).scalars().all()[0]

    return interview
