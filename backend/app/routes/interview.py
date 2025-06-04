import datetime
import io
import json
import os
import random
import shutil
import subprocess
import time
from typing import Literal, LiteralString
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, asc, delete, desc, func, select, update

from app import config, database, schemas
from app import services
from app.configs import openai
from app.lib.errors import CustomException
from app.models import (
    Interview,
    InterviewQuestion,
    InterviewQuestionAndResponse,
    InterviewQuestionResponse,
    Job,
    Recruiter,
)
from app.services import brevo
from app.utils import jwt
from app.dependencies.authorization import authorize_candidate, authorize_recruiter

router = APIRouter()


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
            Interview.job_id,
            Interview.report_file_url,
            Job.title,
            Recruiter.company_name,
        )
        .join(Job, Interview.job_id == Job.id)
        .join(Recruiter, Job.company_id == Recruiter.id)
        .where(Interview.id == interview_id)
    )
    result = db.execute(stmt)
    interview = result.mappings().one()
    return interview


@router.get("/recruiter-view")
async def get_interview_recruiter_view(
    id: str,
    db: Session = Depends(database.get_db),
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
            Interview.job_id,
            Interview.report_file_url,
        )
        .join(Job, Interview.job_id == Job.id)
        .join(Recruiter, Recruiter.id == Job.company_id)
        .where(and_(Interview.id == int(id), Recruiter.id == recruiter_id))
    )

    result = db.execute(stmt)
    interview = dict(result.mappings().one())
    if os.path.exists(f"uploads/interview_video/{int(id)}/video.m3u8"):
        interview["video_url"] = (
            f"{config.settings.URL}/uploads/interview_video/{int(id)}/video.m3u8"
        )

    interview["screenshot_urls"] = []
    if os.path.exists(f"uploads/screenshot/{int(id)}/"):
        for f in os.listdir(f"uploads/screenshot/{int(id)}"):
            interview["screenshot_urls"].append(
                f"{config.settings.URL}/uploads/screenshot/{int(id)}/{f}"
            )
    return interview


@router.get("/recruiter-view/all")
async def get_interview(
    job_id: str = None,
    interview_status: str = None,
    location: str = None,
    sort_by: Literal[
        "interview_status",
        "work_experience",
        "resume_match_score",
        "overall_score",
        "created_at",
    ] = None,
    sort_order: Literal["asc", "desc"] = "desc",
    limit: str = "10",
    offset: str = "0",
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = select(Interview)
    count = 0

    order_column = Interview.id
    if sort_by == "interview_status":
        order_column = Interview.status
    elif sort_by == "work_experience":
        order_column = Interview.work_experience
    elif sort_by == "resume_match_score":
        order_column = Interview.resume_match_score
    elif sort_by == "overall_score":
        order_column = Interview.overall_score
    elif sort_by == "created_at":
        order_column = Interview.created_at

    if job_id:
        stmt = (
            stmt.join(Job)
            .where(
                and_(
                    Job.company_id == recruiter_id,
                    Interview.job_id == int(job_id),
                    Interview.status == interview_status if interview_status else True,
                    Interview.location == location if location else True,
                )
            )
            .limit(int(limit))
            .offset(int(offset))
            .order_by(desc(order_column) if sort_order == "desc" else asc(order_column))
        )
        count_stmt = select(func.count(Interview.id).label("count")).where(
            and_(
                Job.company_id == recruiter_id,
                Interview.job_id == int(job_id),
                Interview.status == interview_status if interview_status else True,
                Interview.location == location if location else True,
            )
        )
    else:
        stmt = (
            stmt.join(Job, Job.id == Interview.job_id)
            .join(Recruiter, Recruiter.id == Job.company_id)
            .where(
                Recruiter.id == recruiter_id,
                Interview.status == interview_status if interview_status else True,
                Interview.location == location if location else True,
            )
            .limit(int(limit))
            .offset(int(offset))
            .order_by(desc(order_column) if sort_order == "desc" else asc(order_column))
        )
        count_stmt = (
            select(func.count(Interview.id).label("count"))
            .join(Job, Job.id == Interview.job_id)
            .join(Recruiter, Recruiter.id == Job.company_id)
            .where(
                and_(
                    Recruiter.id == recruiter_id,
                    Interview.status == interview_status if interview_status else True,
                    Interview.location == location if location else True,
                )
            )
        )
    result = db.execute(stmt)
    interviews = result.scalars().all()
    count = db.execute(count_stmt).mappings().one_or_none() or count

    return {"interviews": interviews, "count": count["count"]}


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

    os.makedirs("uploads/resume", exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(
        "uploads", "resume", f"{interview_id}_{timestamp}_{file.filename}"
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(
            resume_url=file_path,
        )
        .returning(
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
            Interview.job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]

    return interview


@router.post("/send-otp")
async def send_otp(
    interview_id=Depends(authorize_candidate), db: Session = Depends(database.get_db)
):
    stmt = select(Interview.email).where(Interview.id == interview_id)
    interview = db.execute(stmt).mappings().one()

    otp = str(int(random.random() * 1000000))
    otp = otp + "0" * (6 - len(otp))

    brevo.send_otp_email(
        interview["email"],
        otp,
        str(config.settings.OTP_EXPIRY_DURATION_SECONDS) + " seconds",
    )
    stmt = (
        update(Interview)
        .values(
            email_otp=str(otp),
            email_otp_expiry=datetime.datetime.now()
            .astimezone()
            .astimezone(tz=datetime.timezone.utc)
            .replace(tzinfo=None)
            + datetime.timedelta(seconds=config.settings.OTP_EXPIRY_DURATION_SECONDS),
        )
        .where(Interview.id == interview_id)
    )
    db.execute(stmt)
    db.commit()
    return {"message": "successfully sent otp"}


@router.post("/verify-otp")
async def verify_email(
    response: Response,
    verify_otp_data: schemas.VerifyOtpCandidate,
    interview_id=Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    stmt = select(Interview.email_otp, Interview.email_otp_expiry).where(
        Interview.id == interview_id
    )
    interview = db.execute(stmt).mappings().one()

    if interview["email_otp_expiry"] < datetime.datetime.now().astimezone().astimezone(
        tz=datetime.timezone.utc
    ).replace(tzinfo=None):
        response.status_code = 400
        return {"message": "otp expired"}

    if interview["email_otp"] != verify_otp_data.otp:
        response.status_code = 400
        return {"message": "invalid otp"}

    stmt = (
        update(Interview)
        .values(email_verified=True)
        .where(Interview.id == interview_id)
        .returning(Interview)
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]

    return interview


@router.get("/resume")
async def get_resume(
    interview_id: str,
    recruiter_id=Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    stmt = select(Interview.resume_url).where(Interview.id == int(interview_id))
    interview = db.execute(stmt).mappings().one()

    file_path = interview["resume_url"]

    if not file_path:
        return {"message": "No content"}

    return FileResponse(file_path, headers={"Content-Type": "application/pdf"})


@router.put("")
async def update_interview(
    interview_data: schemas.UpdateInterview,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    interview_data = interview_data.model_dump(exclude_unset=True)

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(interview_data)
        .returning(
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
            Interview.job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.mappings().one()
    return interview


@router.post("/analyze-resume")
async def analyze_resume(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(Job.description, Job.requirements, Interview.resume_text)
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).one()

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
        .where(Interview.id == interview_id)
        .returning(
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
            Interview.job_id,
        )
    )

    result = db.execute(stmt)
    db.commit()
    interview = result.mappings().one()

    return interview


@router.put("/generate-feedback")
async def generate_feedback(
    request: Request,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    # Get request body
    body = await request.json()
    transcript = body.get("transcript", "")
    job_requirements = body.get("job_requirements", "")

    stmt = (
        select(
            Job.title,
            Job.description,
            Job.requirements,
            Interview.resume_text,
            Interview.first_name,
            Interview.last_name,
            Interview.created_at,
            Interview.email,
            Interview.phone,
            Interview.location,
            Interview.education,
            Interview.work_experience,
            Interview.skills,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
        )
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).mappings().one()

    stmt = select(
        InterviewQuestionAndResponse.question,
        InterviewQuestionAndResponse.question_type,
        InterviewQuestionAndResponse.answer,
    ).where(InterviewQuestionAndResponse.interview_id == interview_id)
    questions_and_responses = db.execute(stmt).mappings().all()

    stmt = (
        select(
            InterviewQuestion.question,
            InterviewQuestion.question_type,
            InterviewQuestionResponse.answer,
        )
        .join(
            InterviewQuestion,
            InterviewQuestion.id == InterviewQuestionResponse.question_id,
        )
        .where(InterviewQuestionResponse.interview_id == interview_id)
    )
    custom_question_responses = db.execute(stmt).mappings().all()

    conversation = transcript or ""
    if not conversation:
        for question_and_response in questions_and_responses:
            conversation += f"""
                Recruiter: {question_and_response.question} (question type: {question_and_response.question_type})

                Candidate: {question_and_response.answer}
            """

        for response in custom_question_responses:
            conversation += f"""
                Recruiter: {response.question} (question type: {response.question_type})

                Candidate: {response.answer}
            """

    prompt = f"""
        You are evaluating an interview transcript. The candidate is applying for a specific job. Carefully analyze their responses and assess their performance. Be critical, especially when answers are insufficient or irrelevant.

        Follow these rules:
        - If the candidate gave minimal responses (e.g., just "hello" or didn't answer), clearly reflect this in the score and feedback.
        - Use the job role's requirements (implied or given) to evaluate the candidate's suitability.
        - Do NOT be generous with scores if there is no evidence of skill.
        - Feedback for the recruiter should reflect how well the candidate performed, highlighting strengths, weaknesses, red flags, and overall potential for the role.
        - Consider the job requirements and evaluate the candidate's performance across multiple dimensions.

        Return ONLY a JSON object with this exact format:
        {{
            "feedback_for_candidate": "Detailed, specific feedback on their performance, mentioning what they did well or poorly",
            "feedback_for_recruiter": "Detailed evaluation of the candidate's responses. Explain whether the candidate is suitable, why or why not, and which areas were lacking or strong.",
            "score": number between 0 and 100,
            "scoreBreakdown": {{
                "technicalSkills": number between 0 and 100,
                "communication": number between 0 and 100,
                "problemSolving": number between 0 and 100,
                "culturalFit": number between 0 and 100
            }}
            "suggestions": [
                "Each item must be a concrete, actionable suggestion for the candidate",
                "Be specific: e.g., 'Provide examples when answering', 'Work on articulating thoughts clearly'"
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
        {job_requirements or data.requirements}

        Important:
        - Return ONLY the JSON object, no other text
        - All fields must be present
        - All scores must be numbers between 0 and 100
        - Keywords should be relevant to the job and interview
        - Suggestions should be specific and actionable
        - Be critical and honest in your evaluation
        - Consider both the content and quality of responses
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

    os.makedirs(os.path.join("uploads", "report"), exist_ok=True)

    report_file_path = os.path.join(
        "uploads",
        "report",
        f"{interview_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
    )
    from fpdf import FPDF

    pdf = FPDF(unit="pt")
    pdf.add_page()
    full_width = pdf.w - pdf.l_margin - pdf.r_margin
    half_width = (pdf.w - pdf.l_margin - pdf.r_margin) * 0.5
    pdf.set_font("Arial", size=18)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 21.6, "Candidate Interview Report", border=0, ln=1, align="C")
    pdf.ln(18)
    pdf.set_font("Arial", size=16)
    pdf.cell(
        full_width,
        19.2,
        f"{data['first_name']} {data['last_name']}",
        border=0,
        ln=1,
        align="C",
    )
    pdf.ln(16)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(full_width, 16.8, f"Position: {data['title']}", border=0, ln=1, align="C")
    pdf.ln(14)
    pdf.cell(full_width, 16.8, f"Date: {data['created_at']}", border=0, ln=1, align="C")
    pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, "Candidate Information", border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(half_width, 16.8, "Email", border=1)
    pdf.cell(half_width, 16.8, data["email"], border=1, ln=1)
    pdf.cell(half_width, 16.8, "Phone", border=1)
    pdf.cell(half_width, 16.8, data["phone"], border=1, ln=1)
    pdf.cell(half_width, 16.8, "Location", border=1)
    pdf.cell(half_width, 16.8, data["location"], border=1, ln=1)
    pdf.cell(half_width, 16.8, "Education", border=1)
    pdf.cell(half_width, 16.8, data["education"], border=1, ln=1)
    pdf.cell(half_width, 16.8, "Experience", border=1)
    pdf.cell(half_width, 16.8, f"{data['work_experience']} years", border=1, ln=1)
    pdf.cell(half_width, 16.8, "Skills", border=1)
    pdf.cell(half_width, 16.8, data["skills"], border=1, ln=1)
    pdf.ln(14)
    # pdf.set_font("Arial", size=16)
    # pdf.set_text_color(0, 0, 200)
    # pdf.cell(full_width, 19.2, "MCQ Test Results", border=0, ln=1)
    # pdf.ln(8)
    # pdf.set_text_color(0, 0, 0)
    # pdf.set_font("Arial", size=14)
    # pdf.cell(half_width, 16.8, "Total Score", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Technical Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Aptitude Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, "Assessment Results", border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(half_width, 16.8, "Overall Score", border=1)
    pdf.cell(half_width, 16.8, str(interview_data["score"]) + "%", border=1, ln=1)
    pdf.cell(half_width, 16.8, "Resume match Score", border=1)
    pdf.cell(half_width, 16.8, str(data["resume_match_score"]) + "%", border=1, ln=1)
    pdf.cell(half_width, 16.8, "Technical Score", border=1)
    pdf.cell(
        half_width,
        16.8,
        str(interview_data["scoreBreakdown"]["technicalSkills"]) + "%",
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, "Communication Score", border=1)
    pdf.cell(
        half_width,
        16.8,
        str(interview_data["scoreBreakdown"]["communication"]) + "%",
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, "Problem solving Score", border=1)
    pdf.cell(
        half_width,
        16.8,
        str(interview_data["scoreBreakdown"]["problemSolving"]) + "%",
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, "Cultural Fit Score", border=1)
    pdf.cell(
        half_width,
        16.8,
        str(interview_data["scoreBreakdown"]["culturalFit"]) + "%",
        border=1,
        ln=1,
    )
    pdf.ln(14)
    # pdf.set_font("Arial", size=16)
    # pdf.set_text_color(0, 0, 200)
    # pdf.cell(full_width, 19.2, "MCQ Test Results", border=0, ln=1)
    # pdf.ln(8)
    # pdf.set_text_color(0, 0, 0)
    # pdf.set_font("Arial", size=14)
    # pdf.cell(half_width, 16.8, "Total Score", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Technical Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Aptitude Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, "Feedback", border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.multi_cell(full_width, 16.8, interview_data["feedback_for_candidate"], border=0)
    pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, "Resume match Feedback", border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.multi_cell(full_width, 16.8, str(data["resume_match_feedback"]), border=0)

    pdf.output(report_file_path)

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(
            status="completed",
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
            report_file_url=f"{config.settings.URL}/{report_file_path}",
        )
        .returning(
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
            Interview.job_id,
            Interview.report_file_url,
        )
    )

    db.execute(stmt)
    db.commit()

    return {
        "feedback": interview_data["feedback_for_candidate"],
        "score": interview_data["score"],
        "scoreBreakdown": interview_data["scoreBreakdown"],
        "suggestions": interview_data["suggestions"],
        "keywords": interview_data["keywords"],
    }


@router.post("/record")
async def record_interview(
    request: Request,
    background_tasks: BackgroundTasks,
    finished: str = "false",
    interview_id=Depends(authorize_candidate),
):
    if finished == "true":
        ffmpeg_command = [
            "ffmpeg",
            "-i",
            os.path.join("uploads", "interview_video", str(interview_id), "video.webm"),
            "-r",
            "30",
            "-hls_time",
            "10",
            "-hls_list_size",
            "0",
            "-f",
            "hls",
            os.path.join("uploads", "interview_video", str(interview_id), "video.m3u8"),
        ]
        background_tasks.add_task(subprocess.Popen(ffmpeg_command))
        return
    data = await request.body()
    os.makedirs(
        os.path.join("uploads", "interview_video", str(interview_id)), exist_ok=True
    )
    file_path = os.path.join(
        "uploads", "interview_video", str(interview_id), "video.webm"
    )

    with open(file_path, "ab") as buffer:
        buffer.write(data)
    return


@router.post("/screenshot")
async def save_screenshot(request: Request, interview_id=Depends(authorize_candidate)):
    try:
        data = await request.body()
        if not data:
            raise HTTPException(status_code=400, detail="No screenshot data provided")

        # Create directory if it doesn't exist
        os.makedirs(
            os.path.join("uploads", "screenshot", str(interview_id)), exist_ok=True
        )

        # Generate filename with timestamp
        timestamp = int(time.time())
        file_path = os.path.join(
            "uploads", "screenshot", str(interview_id), f"{timestamp}.png"
        )

        # Save the screenshot
        with open(file_path, "wb") as f:
            f.write(data)

        return {"message": "Screenshot saved successfully", "timestamp": timestamp}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to save screenshot: {str(e)}"
        )


@router.delete("", status_code=204)
async def delete_interview(
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


@router.post("/interview-question-response")
async def create_interview_question_response(
    response_data: schemas.CreateInterviewQuestionResponse,
    interview_id: int = Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    return services.interview_question_response.create_interview_question_response(
        response_data, interview_id, db
    )
