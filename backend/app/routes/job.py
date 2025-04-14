from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import case, delete, select

from app import schemas, database
from app.models import Job, Recruiter
from app.dependencies.authorization import authorize_recruiter
from app.configs import openai

router = APIRouter()


@router.get("")
async def get_job(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
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
        Job.salary_min,
        Job.salary_max,
        Job.show_salary,
        Job.requirements,
        Job.benefits,
        Job.status,
    ).where(Job.id == int(id))
    result = db.execute(stmt)
    job = result.scalars().all()[0]

    return job


@router.get("/all")
async def get_all_job(
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
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
        Job.salary_min,
        Job.salary_max,
        Job.show_salary,
        Job.requirements,
        Job.benefits,
        Job.status,
    ).where(Job.company_id == recruiter_id)
    result = db.execute(stmt)
    jobs = result.all()

    return [job._mapping for job in jobs]


@router.get("/candidate-view")
async def get_job_candidate_view(
    request: Request, id: str, db: Session = Depends(database.get_db)
):
    stmt = (
        select(
            Job.id,
            Job.title,
            Job.description,
            Job.department,
            Job.location,
            Job.type,
            Job.min_experience,
            Job.max_experience,
            case((Job.show_salary == True, Job.salary_min), else_=None).label(
                "salary_min"
            ),
            case((Job.show_salary == True, Job.salary_max), else_=None).label(
                "salary_max"
            ),
            Job.requirements,
            Job.benefits,
            Job.created_at,
            Job.company_id,
            Recruiter.company_name,
            Recruiter.company_logo,
        )
        .join(Recruiter)
        .where(Job.id == int(id))
    )
    result = db.execute(stmt)
    job = result.all()[0]._mapping
    return job


@router.post("", response_model=schemas.Job)
async def create_job(
    job_data: schemas.CreateJob,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
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
        company_id=recruiter_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.post("/generate-description")
async def generate_description(generate_jd_data: schemas.GenerateJobDescription):
    prompt = f"""
    Create a comprehensive job description for a {generate_jd_data.title} position in the {generate_jd_data.department} department.
    The position is {generate_jd_data.location}-based.
    
    Include the following sections:
    1. Overview of the role and responsibilities
    2. Requirements and qualifications
    3. Benefits and perks
    
    Format the content with markdown, using ## for section headers.
    """

    print(f"Making OpenAI API call with model: gpt-4")
    response = await openai.client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating compelling job descriptions.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=1000,
    )
    description = response.choices[0].message.content

    return {"description": description}


@router.post("/generate-requirements")
async def generate_requirements(generate_jr_data: schemas.GenerateJobRequirement):
    """Generate job requirements using OpenAI"""
    prompt = f"""
    Create a comprehensive list of requirements for a {generate_jr_data.title} position in the {generate_jr_data.department} department.
    The position is {generate_jr_data.location}-based.
    
    {f"Additional keywords to consider: {generate_jr_data.keywords}" if generate_jr_data.keywords else ""}
    
    Include:
    1. Required qualifications and education
    2. Required experience and skills
    3. Technical requirements
    4. Soft skills and personal attributes
    
    Format the content with bullet points.
    """

    response = await openai.client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating detailed job requirements.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=1000,
    )
    requirements = response.choices[0].message.content
    return {"requirements": requirements}


@router.delete("", status_code=204)
async def delete_job(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = delete(Job).where(Job.id == int(id))
    db.execute(stmt)
    db.commit()
    return
