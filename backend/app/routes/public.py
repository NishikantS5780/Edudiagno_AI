from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import database, services


router = APIRouter()


@router.get("/interview-question")
async def get_interview_questions_by_job(
    job_id: int, db: Session = Depends(database.get_db)
):
    return services.interview_question.get_interview_question_by_job_id(job_id, db)
