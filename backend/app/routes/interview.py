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
from sqlalchemy import and_, delete, select, update

from app import database, schemas
from app.configs import openai
from app.models import Interview, InterviewQuestionAndResponse, Job, Recruiter
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


@router.get("/recruiter-view")
async def get_interview_recruiter_view(
    db: Session = Depends(database.get_db),
    interview_id=str,
    recruiter_id=Depends(authorize_recruiter),
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
            Interview.technical_skills_score,
            Interview.communication_skills_score,
            Interview.problem_solving_skills_score,
            Interview.cultural_fit_score,
            Interview.feedback,
        )
        .join(Job, Interview.job_id == Job.id)
        .join(Recruiter, Recruiter.id == Job.company_id)
        .where(and_(Interview.id == int(interview_id), Recruiter.id == recruiter_id))
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


@router.delete("", status_code=204)
async def update_interview(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    job_subq = select(Job.id).where(Job.company_id == recruiter_id).subquery()
    stmt = (
        delete(Interview)
        .where(Interview.job_id.in_(select(job_subq)))
        .where(Interview.id == int(id))
    )
    db.execute(stmt)
    db.commit()
    return


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

    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]

    return interview


@router.put("/generate-feedback")
async def generate_feedback(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(Job.description, Job.requirements, Interview.resume_text)
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).all()[0]

    stmt = select(
        InterviewQuestionAndResponse.question,
        InterviewQuestionAndResponse.question_type,
        InterviewQuestionAndResponse.answer,
    ).where(InterviewQuestionAndResponse.interview_id == interview_id)
    questions_and_responses = db.execute(stmt).all()
    questions_and_responses = [q_a._mapping for q_a in questions_and_responses]

    conversation = ""
    for question_and_response in questions_and_responses:
        conversation += f"""
            Recruiter: {question_and_response.question} (question type: {question_and_response.question_type})

            Candidate: {question_and_response.answer}
        """

    prompt = f"""Analyze the interview responses and provide detailed feedback. Consider the job requirements and evaluate the candidate's performance across multiple dimensions.

    Return ONLY a JSON object with these exact fields:
    {{
        "feedback_for_candidate": "Detailed feedback about the interview performance",
        "feedback_for_recruiter": "Comprehensive analysis for the recruiter",
        "score": number between 0 and 100,
        "scoreBreakdown": {{
            "technicalSkills": number between 0 and 100,
            "communication": number between 0 and 100,
            "problemSolving": number between 0 and 100,
            "culturalFit": number between 0 and 100
        }},
        "suggestions": [
            "List of specific suggestions for improvement",
            "Each suggestion should be actionable and specific"
        ],
        "keywords": [
            {{
                "term": "string",
                "count": number,
                "sentiment": "positive" | "neutral" | "negative"
            }}
        ]
    }}

    Conversation:
    {conversation}

    Job Description:
    {data.description}

    Job Requirements:
    {data.requirements}

    Important:
    - Return ONLY the JSON object, no other text
    - All fields must be present
    - All scores must be numbers between 0 and 100
    - Keywords should be relevant to the job and interview
    - Suggestions should be specific and actionable
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are an expert interviewer and evaluator. Provide detailed, constructive feedback.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    interview_analysis = response.choices[0].message.content
    interview_data = json.loads(interview_analysis)

    stmt = (
        update(Interview)
        .values(
            overall_score=int(interview_data["score"]),
            feedback=interview_data["feedback_for_recruiter"],
            technical_skills_score=interview_data["scoreBreakdown"]["technicalSkills"],
            communication_skills_score=interview_data["scoreBreakdown"][
                "communication"
            ],
            problem_solving_skills_score=interview_data["scoreBreakdown"][
                "problemSolving"
            ],
            cultural_fit_score=interview_data["scoreBreakdown"]["culturalFit"],
        )
        .returning(Interview)
    )

    db.execute(stmt).scalars().all()[0]
    db.commit()

    return {
        "feedback": interview_data["feedback_for_candidate"],
        "score": interview_data["score"],
        "scoreBreakdown": interview_data["scoreBreakdown"],
        "suggestions": interview_data["suggestions"],
        "keywords": interview_data["keywords"],
    }
