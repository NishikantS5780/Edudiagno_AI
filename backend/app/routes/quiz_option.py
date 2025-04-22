from fastapi import APIRouter, Depends
from sqlalchemy import delete, update
from sqlalchemy.orm import Session

from app import database, schemas
from app.dependencies.authorization import authorize_recruiter
from app.models import QuizOption

router = APIRouter()


@router.post("")
async def create_quiz_option(
    option_data: schemas.CreateQuizOption,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_option = QuizOption(
        label=option_data.label,
        correct=option_data.correct,
        question_id=option_data.question_id,
    )
    db.add(quiz_option)
    db.commit()
    db.refresh(quiz_option)
    return quiz_option


@router.put("")
async def update_quiz_option(
    option_data: schemas.UpdateQuizOption,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = (
        update(QuizOption)
        .values(label=option_data.label, correct=option_data.correct)
        .where(QuizOption.id == option_data.id)
        .returning(QuizOption.label, QuizOption.correct)
    )
    result = db.execute(stmt)
    db.commit()
    quiz_option = result.all()[0]._mapping
    return quiz_option


@router.delete("", status_code=204)
async def delete_quiz_option(
    option_id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = delete(QuizOption).where(QuizOption.id == int(option_id))
    db.execute(stmt)
    db.commit()
