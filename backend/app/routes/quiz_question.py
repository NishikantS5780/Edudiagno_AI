from fastapi import APIRouter, Depends
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database, schemas
from app.dependencies.authorization import authorize_candidate, authorize_recruiter
from app.models import QuizOption, QuizQuestion

router = APIRouter()


@router.post("")
async def create_quiz_question(
    quiz_data: schemas.CreateQuizQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_question = QuizQuestion(
        description=quiz_data.description, job_id=quiz_data.job_id
    )
    db.add(quiz_question)
    db.commit()
    db.refresh(quiz_question)
    return quiz_question


@router.get("")
async def get_quiz_question(
    question_id: str,
    db: Session = Depends(database.get_db),
):
    stmt = select(QuizQuestion.description).where(QuizQuestion.id == int(question_id))
    quiz_question = db.execute(stmt).all()[0]._mapping
    stmt = select(QuizOption.label, QuizOption.correct).where(
        QuizOption.question_id == int(question_id)
    )
    options = [option._mapping for option in db.execute(stmt).all()]
    return {"question": quiz_question, "options": options}


@router.put("")
async def update_quiz_question(
    quiz_data: schemas.UpdateQuizQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = (
        update(QuizQuestion)
        .values(description=quiz_data.description)
        .where(QuizQuestion.id == quiz_data.id)
        .returning(QuizQuestion.description)
    )
    result = db.execute(stmt)
    db.commit()
    quiz_question = result.all()[0]._mapping
    return quiz_question


@router.delete("", status_code=204)
async def delete_quiz_question(
    question_id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = delete(QuizQuestion).where(QuizQuestion.id == int(question_id))
    db.execute(stmt)
    db.commit()
    return
