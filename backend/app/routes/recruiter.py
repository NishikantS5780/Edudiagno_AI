import datetime
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app import database, models, schemas
from app.dependencies.authorization import authorize_recruiter
from app.models import Recruiter
from app.services import brevo
from app.utils import security
from app.utils import jwt

router = APIRouter()


@router.get("", response_model=schemas.Recruiter)
async def get_recruiter(
    request: Request,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = select(Recruiter).where(Recruiter.id == int(id))
    result = db.execute(stmt)
    recruiter = result.scalars().all()[0]

    return recruiter


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
    stmt = select(Recruiter).where(Recruiter.email == login_data.email)
    recruiter = db.execute(stmt).scalars().all()[0]

    password_match = security.verify_password(
        login_data.password, recruiter.password_hash
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
    import random
    import time

    # otp = int(random.random() * 1000000)
    otp = 111111
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
    recruiter = db.execute(stmt).all()[0]._mapping

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
