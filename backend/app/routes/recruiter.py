from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app import database, models, schemas
from app.utils import security

router = APIRouter()


@router.get("/")
async def get_recruiter(request: Request):
    return {"msg": "hi"}


@router.post("", status_code=status.HTTP_201_CREATED)
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
