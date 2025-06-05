import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import Float, func, select, update
import random

from app import config, database, models, schemas
from app import services
from app.dependencies.authorization import authorize_recruiter
from app.lib.errors import CustomException
from app.models import Recruiter
from app.services import brevo
from app.utils import security
from app.utils import jwt

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.Recruiter)
async def register_recruiter(
    request: Request,
    recruiter_data: schemas.RecruiterRegistration,
    db: Session = Depends(database.get_db),
):
    password_hash = security.hash_password(recruiter_data.password)

    db_user = models.Recruiter(
        name=recruiter_data.name,
        email=recruiter_data.email,
        password_hash=password_hash,
        phone=recruiter_data.phone,
        designation=recruiter_data.designation,
        company_name=recruiter_data.company_name,
        industry=recruiter_data.industry,
        country=recruiter_data.country,
        state=recruiter_data.state,
        city=recruiter_data.city,
        zip=recruiter_data.zip,
        address=recruiter_data.address,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
async def login_recruiter(
    request: Request,
    response: Response,
    login_data: schemas.RecruiterLogin,
    db: Session = Depends(database.get_db),
):
    stmt = select(
        Recruiter.id,
        Recruiter.name,
        Recruiter.email,
        Recruiter.password_hash,
        Recruiter.email_verified,
        Recruiter.phone,
        Recruiter.designation,
        Recruiter.company_name,
        Recruiter.company_logo,
        Recruiter.website,
        Recruiter.industry,
        Recruiter.min_company_size,
        Recruiter.max_company_size,
        Recruiter.country,
        Recruiter.state,
        Recruiter.city,
        Recruiter.zip,
        Recruiter.address,
        Recruiter.verified,
        Recruiter.created_at,
        Recruiter.updated_at,
    ).where(Recruiter.email == login_data.email)
    recruiter = db.execute(stmt).mappings().one()

    password_match = security.verify_password(
        login_data.password, recruiter["password_hash"]
    )

    if not password_match:
        response.status_code = 500
        return {"message": "invalid credentials"}

    encoded_jwt = jwt.encode(
        {
            "id": recruiter.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(days=1),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    recruiter_data = dict(recruiter)
    recruiter_data.pop("password_hash")
    return recruiter_data


@router.get("", response_model=schemas.Recruiter)
async def get_recruiter(
    request: Request,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = select(Recruiter).where(Recruiter.id == int(recruiter_id))
    result = db.execute(stmt)
    recruiter = result.scalars().all()[0]

    return recruiter


@router.put("")
async def upate_recruiter(
    request: Request,
    recruiter_data: schemas.UpdateRecruiter,
    recruiter_id=Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    password_hash = None
    if recruiter_data.password:
        password_hash = security.hash_password(recruiter_data.password)

    data = recruiter_data.model_dump(exclude_none=True)
    if "password" in data:
        data.pop("password")
    if password_hash:
        data["password_hash"] = password_hash

    stmt = (
        update(Recruiter)
        .values(data)
        .where(Recruiter.id == recruiter_id)
        .returning(
            Recruiter.id,
            Recruiter.name,
            Recruiter.email,
            Recruiter.email_verified,
            Recruiter.phone,
            Recruiter.designation,
            Recruiter.company_name,
            Recruiter.company_logo,
            Recruiter.website,
            Recruiter.industry,
            Recruiter.min_company_size,
            Recruiter.max_company_size,
            Recruiter.country,
            Recruiter.state,
            Recruiter.city,
            Recruiter.zip,
            Recruiter.address,
            Recruiter.verified,
        )
    )

    result = db.execute(stmt)
    db.commit()
    recruiter = result.all()[0]._mapping
    return recruiter


@router.get("/verify-token")
async def verify_recruiter_access_token(
    recruiter_id=Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    stmt = select(Recruiter).where(Recruiter.id == recruiter_id)
    recruiter = db.execute(stmt).scalars().all()[0]

    return recruiter


@router.post("/send-otp")
async def send_otp(
    send_otp_data: schemas.RecruiterSendEmailOtp, db: Session = Depends(database.get_db)
):
    otp = str(int(random.random() * 1000000))
    otp = otp + "0" * (6 - len(otp))

    brevo.send_otp_email(send_otp_data.email, otp, "1 min")
    stmt = (
        update(Recruiter)
        .values(
            email_otp=otp,
            email_otp_expiry=datetime.datetime.now()
            .astimezone()
            .astimezone(tz=datetime.timezone.utc)
            .replace(tzinfo=None)
            + datetime.timedelta(seconds=60),
        )
        .where(Recruiter.email == send_otp_data.email)
    )
    db.execute(stmt)
    db.commit()
    return {"message": "successfully sent otp"}


@router.post("/verify-otp")
async def verify_otp(
    response: Response,
    verify_otp_data: schemas.RecruiterVerifyEmailOtp,
    db: Session = Depends(database.get_db),
):
    stmt = select(Recruiter.email_otp, Recruiter.email_otp_expiry).where(
        Recruiter.email == verify_otp_data.email
    )
    recruiter = db.execute(stmt).mappings().one()

    if recruiter["email_otp_expiry"] < datetime.datetime.now().astimezone().astimezone(
        tz=datetime.timezone.utc
    ).replace(tzinfo=None):
        response.status_code = 400
        return {"message": "otp expired"}

    if recruiter["email_otp"] != verify_otp_data.otp:
        response.status_code = 400
        return {"message": "invalid otp"}

    stmt = (
        update(Recruiter)
        .values(email_verified=True)
        .where(Recruiter.email == verify_otp_data.email)
        .returning(Recruiter)
    )
    result = db.execute(stmt)
    db.commit()
    recruiter = result.scalars().all()[0]

    encoded_jwt = jwt.encode(
        {
            "id": recruiter.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(days=1),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    return recruiter


@router.post("/interview-question")
async def create_interview_questions(
    interview_question_data: schemas.CreateInterviewQuestion,
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    return services.interview_question.create_interview_question(
        interview_question_data, db
    )


@router.put("/interview-question")
async def update_interview_question(
    interview_question_data: schemas.UpdateInterviewQuestion,
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    return services.interview_question.update_interview_question(
        interview_question_data, db
    )


@router.delete("/interview-question")
async def delete_interview_question(
    id: int,
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    return services.interview_question.delete_interview_question(id, db)


@router.get("/interview-question")
async def get_interview_question_by_job(
    interview_id: int,
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    return services.interview_question_response.get_interview_question_response_by_interview_id(
        interview_id, db
    )


@router.get("/interview-question-response")
async def get_interview_question_response_by_interview(
    interview_id: int,
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    return services.interview_question_response.get_interview_question_response_by_interview_id(
        interview_id, db
    )


@router.get("/analytics")
async def get_analytics(
    recruiter_id: int = Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    now = datetime.datetime.utcnow()
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_prev_month = (first_day_this_month - datetime.timedelta(days=1)).replace(
        day=1
    )
    last_day_prev_month = first_day_this_month - datetime.timedelta(seconds=1)

    today = now.date()
    start_of_week = today - datetime.timedelta(days=today.weekday())
    daily_interviews_this_week = []
    for i in range((today - start_of_week).days + 1):
        day = start_of_week + datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        count = db.execute(
            select(func.count(models.Interview.id))
            .join(models.Job, models.Job.id == models.Interview.job_id)
            .where(
                models.Job.company_id == recruiter_id,
                models.Interview.created_at >= day_start,
                models.Interview.created_at <= day_end,
            )
        ).scalar()
        daily_interviews_this_week.append({"date": day.isoformat(), "count": count})

    interviews_completed_this_month = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
            models.Interview.created_at >= first_day_this_month,
            models.Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    interviews_completed_prev_month = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
            models.Interview.created_at >= first_day_prev_month,
            models.Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_jobs = db.execute(
        select(func.count(models.Job.id)).where(models.Job.company_id == recruiter_id)
    ).scalar()

    total_interviews_conducted = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(models.Job.company_id == recruiter_id)
    ).scalar()

    interviews_conducted_this_month = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.created_at >= first_day_this_month,
            models.Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    interviews_conducted_prev_month = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.created_at >= first_day_prev_month,
            models.Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_interviews_completed = db.execute(
        select(func.count(models.Interview.id))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
        )
    ).scalar()


    avg_score = (
        db.execute(
            select(func.avg(models.Interview.overall_score.cast(Float)))
            .join(models.Job, models.Job.id == models.Interview.job_id)
            .where(
                models.Job.company_id == recruiter_id,
                models.Interview.status == "completed",
                models.Interview.created_at >= first_day_this_month,
                models.Interview.created_at < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
            )
        ).scalar()
        or 0
    )

    total_candidates = db.execute(
        select(func.count(func.distinct(models.Interview.email)))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
        )
    ).scalar()

    candidates_this_month = db.execute(
        select(func.count(func.distinct(models.Interview.email)))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
            models.Interview.created_at >= first_day_this_month,
            models.Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    candidates_prev_month = db.execute(
        select(func.count(func.distinct(models.Interview.email)))
        .join(models.Job, models.Job.id == models.Interview.job_id)
        .where(
            models.Job.company_id == recruiter_id,
            models.Interview.status == "completed",
            models.Interview.created_at >= first_day_prev_month,
            models.Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_open_jobs = db.execute(
        select(func.count(models.Job.id)).where(
            models.Job.company_id == recruiter_id, models.Job.status == "active"
        )
    ).scalar()

    total_closed_jobs = db.execute(
        select(func.count(models.Job.id)).where(
            models.Job.company_id == recruiter_id, models.Job.status == "closed"
        )
    ).scalar()

    active_jobs_this_month = db.execute(
        select(func.count(models.Job.id)).where(
            models.Job.company_id == recruiter_id,
            models.Job.status == "active",
            models.Job.created_at >= first_day_this_month,
            models.Job.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    active_jobs_prev_month = db.execute(
        select(func.count(models.Job.id)).where(
            models.Job.company_id == recruiter_id,
            models.Job.status == "active",
            models.Job.created_at >= first_day_prev_month,
            models.Job.created_at <= last_day_prev_month,
        )
    ).scalar()

    return {
        "total_jobs": total_jobs,
        "total_open_jobs": total_open_jobs,
        "total_closed_jobs": total_closed_jobs,
        "total_interviews_conducted": total_interviews_conducted,
        "total_interviews_conducted_this_month": interviews_conducted_this_month,
        "total_interviews_conducted_prev_month": interviews_conducted_prev_month,
        "total_interviews_completed": total_interviews_completed,
        "interviews_completed_this_month": interviews_completed_this_month,
        "interviews_completed_prev_month": interviews_completed_prev_month,
        "total_candidates": total_candidates,
        "average_candidate_score": round(avg_score, 2) if avg_score else 0,
        "active_jobs_this_month": active_jobs_this_month,
        "active_jobs_prev_month": active_jobs_prev_month,
        "candidates_this_month": candidates_this_month,
        "candidates_prev_month": candidates_prev_month,
        "daily_interviews_this_week": daily_interviews_this_week,
    }
