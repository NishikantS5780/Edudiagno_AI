from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database, schemas
from app.dependencies.authorization import (
    authorize_candidate,
    authorize_recruiter,
)
from app.models import Interview, Job, QuizOption, QuizQuestion

router = APIRouter()


@router.post("")
async def create_quiz_question(
    quiz_data: schemas.CreateQuizQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_question = QuizQuestion(
        description=quiz_data.description,
        type=quiz_data.type,
        category=quiz_data.category,
        job_id=quiz_data.job_id,
        time_seconds=quiz_data.time_seconds,
    )
    db.add(quiz_question)
    db.commit()
    db.refresh(quiz_question)
    return quiz_question


@router.get("")
async def get_quiz_questions_for_interview(
    response: Response,
    interview_id: str = None,
    job_id: str = None,
    db: Session = Depends(database.get_db),
):
    if interview_id:
        stmt = (
            select(
                QuizQuestion.id,
                QuizQuestion.description,
                QuizQuestion.type,
                QuizQuestion.category,
                QuizQuestion.time_seconds,
            )
            .join(Job, QuizQuestion.job_id == Job.id)
            .join(Interview, Interview.job_id == Job.id)
            .where(Interview.id == int(interview_id))
        )
    elif job_id:
        stmt = select(
            QuizQuestion.id,
            QuizQuestion.description,
            QuizQuestion.type,
            QuizQuestion.category,
        ).where(QuizQuestion.job_id == int(job_id))
    else:
        # stmt = select(QuizQuestion.id, QuizQuestion.description, QuizQuestion.type)
        response.status_code = 400
        return {"msg": "interview id is required"}

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
    quiz_data = quiz_data.model_dump(exclude_unset=True)
    question_id = quiz_data.pop("id", None)
    stmt = (
        update(QuizQuestion)
        .values(quiz_data)
        .where(QuizQuestion.id == question_id)
        .returning(QuizQuestion.description, QuizQuestion.type, QuizQuestion.category)
    )
    result = db.execute(stmt)
    db.commit()
    quiz_question = result.mappings().one()
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
