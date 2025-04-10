from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import case, select

from app import schemas, database
from app.models import Job

router = APIRouter()


@router.get("/{id}", response_model=schemas.Job)
async def get_job(request: Request, id: str, db: Session = Depends(database.get_db)):
    stmt = select(Job).where(Job.id == int(id))
    result = db.execute(stmt)
    job = result.scalars().all()[0]

    return job


@router.get("/{id}")
async def get_job_candidate_view(
    request: Request, id: str, db: Session = Depends(database.get_db)
):
    stmt = select(
        Job.id,
        Job.title,
        Job.description,
        Job.department,
        Job.location,
        Job.type,
        Job.min_experience,
        Job.max_experience,
        case((Job.show_salary == True, Job.salary_min), else_=None).label("salary_min"),
        case((Job.show_salary == True, Job.salary_max), else_=None).label("salary_max"),
        Job.requirements,
        Job.benefits,
        Job.created_at,
        Job.company_id,
    ).where(Job.id == int(id))
    result = db.execute(stmt)
    job = result.all()[0]._mapping
    return job


@router.post("", response_model=schemas.Job)
async def create_job(
    request: Request,
    job_data: schemas.CreateJob,
    db: Session = Depends(database.get_db),
):
    job = Job(
        title=job_data.title,
        description=job_data.description,
        department=job_data.department,
        location=job_data.location,
        type=job_data.type,
        min_experience=job_data.min_experience,
        max_experience=job_data.max_experience,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        show_salary=job_data.show_salary,
        requirements=job_data.requirements,
        benefits=job_data.benefits,
        status=job_data.status,
        company_id=job_data.company_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
