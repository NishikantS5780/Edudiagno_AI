import datetime
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app import database, models, schemas
from app.dependencies.authorization import authorize_recruiter
from app.models import Recruiter
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
    request: Request,
    recruiter_id=Depends(authorize_recruiter),
):
    return {"message": "successfull authentication"}
