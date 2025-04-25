from fastapi import APIRouter, Depends
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database, schemas
from app.dependencies.authorization import authorize_candidate, authorize_recruiter
from app.models import Interview, Job, QuizOption, QuizQuestion

router = APIRouter()


@router.post("")
async def create_quiz_question(
    quiz_data: schemas.CreateQuizQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_question = QuizQuestion(
        description=quiz_data.description, type=quiz_data.type, job_id=quiz_data.job_id
    )
    db.add(quiz_question)
    db.commit()
    db.refresh(quiz_question)
    return quiz_question


@router.get("")
async def get_quiz_questions_for_interview(
    db: Session = Depends(database.get_db), interview_id=Depends(authorize_candidate)
):
    stmt = (
        select(QuizQuestion.id, QuizQuestion.description, QuizQuestion.type)
        .join(Job, QuizQuestion.job_id == Job.id)
        .join(Interview, Interview.job_id == Job.id)
        .where(Interview.id == interview_id)
    )
    quiz_questions = [
        dict(quiz_question._mapping) for quiz_question in db.execute(stmt).all()
    ]

    for quiz_question in quiz_questions:
        stmt = select(QuizOption.id, QuizOption.label, QuizOption.correct).where(
            QuizOption.question_id == quiz_question["id"]
        )
        options = [option._mapping for option in db.execute(stmt).all()]
        quiz_question["options"] = options
    return quiz_questions


@router.put("")
async def update_quiz_question(
    quiz_data: schemas.UpdateQuizQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = (
        update(QuizQuestion)
        .values(description=quiz_data.description, type=quiz_data.type)
        .where(QuizQuestion.id == quiz_data.id)
        .returning(QuizQuestion.description, QuizQuestion.type)
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
