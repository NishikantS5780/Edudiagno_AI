from typing import Literal
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import asc, case, delete, desc, select, and_, update
from fastapi import HTTPException, status

from app import schemas, database
from app.models import DSAQuestion, Job, QuizQuestion, Recruiter
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
        Job.city,
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
        Job.created_at,
    ).where(Job.id == int(id))
    result = db.execute(stmt)
    job = result.all()[0]._mapping

    return job


@router.get("/all")
async def get_all_job(
    start: str = "0",
    limit: str = "10",
    sort_field: Literal[
        "title", "department", "location", "type", "show_salary", "status"
    ] = None,
    sort: str = "ascending",
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    order_column = Job.id

    if sort_field == "title":
        order_column = Job.title
    elif sort_field == "department":
        order_column = Job.department
    elif sort_field == "location":
        order_column = Job.location
    elif sort_field == "type":
        order_column = Job.type
    elif sort_field == "show_salary":
        order_column = Job.show_salary
    elif sort_field == "status":
        order_column = Job.status

    stmt = (
        select(
            Job.id,
            Job.title,
            Job.description,
            Job.department,
            Job.city,
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
            Job.created_at,
        )
        .where(Job.company_id == recruiter_id)
        .order_by(desc(order_column) if sort == "descending" else asc(order_column))
        .limit(int(limit))
        .offset(int(start))
    )
    result = db.execute(stmt)
    jobs = result.all()

    return [job._mapping for job in jobs]


@router.get("/candidate-view")
async def get_job_candidate_view(
    request: Request, id: str, db: Session = Depends(database.get_db)
):
    hasDSATest = False
    hasQuiz = False

    stmt = select(DSAQuestion.id).where(DSAQuestion.job_id == int(id))
    result = db.execute(stmt).all()
    if len(result):
        hasDSATest = True

    stmt = select(QuizQuestion.id).where(QuizQuestion.job_id == int(id))
    result = db.execute(stmt).all()
    if len(result):
        hasQuiz = True

    stmt = (
        select(
            Job.id,
            Job.title,
            Job.description,
            Job.department,
            Job.city,
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
    job = dict(result.all()[0]._mapping)
    job["hasDSATest"] = hasDSATest
    job["hasQuiz"] = hasQuiz
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
        city=job_data.city,
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
    Create a detailed job description for a {generate_jd_data.title} position in the {generate_jd_data.department} department.
    The position is {generate_jd_data.location}-based.
    
    Focus ONLY on describing the role, responsibilities, and day-to-day activities.
    Do NOT include requirements, qualifications, or benefits.
    
    Return the content in plain text format only. Do not use any markdown, headers, or special formatting.
    Use simple paragraphs and bullet points with dashes (-) if needed.
    """

    print(f"Making OpenAI API call with model: gpt-3.5-turbo")
    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating compelling job descriptions. Focus only on describing the role and responsibilities. Return plain text only, no markdown or special formatting.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    description = response.choices[0].message.content

    return {"description": description}


@router.post("/generate-requirements")
async def generate_requirements(generate_jr_data: schemas.GenerateJobRequirement):
    """Generate job requirements using OpenAI"""
    prompt = f"""
    Create a focused list of requirements for a {generate_jr_data.title} position in the {generate_jr_data.department} department.
    The position is {generate_jr_data.location}-based.
    
    {f"Additional keywords to consider: {generate_jr_data.keywords}" if generate_jr_data.keywords else ""}
    
    Include:
    1. Required qualifications and education
    2. Required experience and skills
    3. Technical requirements
    4. Soft skills and personal attributes
    
    Return the content in plain text format only. Do not use any markdown, headers, or special formatting.
    Use simple bullet points with dashes (-) for each requirement.
    Keep the requirements specific and measurable.
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating detailed job requirements. Focus on specific, measurable requirements. Return plain text only, no markdown or special formatting.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=300,
    )
    requirements = response.choices[0].message.content
    return {"requirements": requirements}


@router.put("")
async def update_job(
    job_data: schemas.UpdateJob,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = (
        update(Job)
        .values(
            title=job_data.title,
            description=job_data.description,
            department=job_data.department,
            city=job_data.city,
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
        )
        .where(and_(Job.company_id == recruiter_id, Job.id == job_data.id))
        .returning(
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
            Job.company_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    job = result.all()[0]._mapping
    return job


@router.delete("", status_code=204)
async def delete_job(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = select(Job).where(and_(Job.id == int(id), Job.company_id == recruiter_id))
    result = db.execute(stmt)
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to delete it",
        )

    # Delete the job
    stmt = delete(Job).where(and_(Job.id == int(id), Job.company_id == recruiter_id))
    db.execute(stmt)
    db.commit()
    return
