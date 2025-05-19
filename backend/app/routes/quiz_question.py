import os
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from os import path

from app import config, database, schemas
from app.dependencies.authorization import (
    authorize_candidate,
    authorize_recruiter,
)
from app.models import Interview, Job, QuizOption, QuizQuestion

router = APIRouter()


@router.post("")
async def create_quiz_question(
    description: str = Form(...),
    type: str = Form(...),
    category: str = Form(...),
    job_id: int = Form(...),
    time_seconds: int = Form(),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_question = QuizQuestion(
        description=description,
        type=type,
        category=category,
        job_id=job_id,
        time_seconds=time_seconds,
    )
    db.add(quiz_question)
    db.commit()
    db.refresh(quiz_question)

    if not path.exists(path.join("uploads", "image")):
        os.makedirs(path.join("uploads", "image"))

    if image:
        with open(
            path.join("uploads", "image", f"quiz_{quiz_question.id}.png"), "wb"
        ) as f:
            for chunk in image.file:
                f.write(chunk)

    quiz_question.image_url = (
        f"{config.settings.URL}/uploads/image/quiz_{quiz_question.id}.png"
    )

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
                QuizQuestion.image_url,
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
            QuizQuestion.image_url,
        ).where(QuizQuestion.job_id == int(job_id))
    else:
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
    description: str = Form(),
    type: str = Form(),
    category: str = Form(),
    time_seconds: int = Form(),
    id: int = Form(),
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    quiz_data = {}
    if description:
        quiz_data["description"] = description
    if type:
        quiz_data["type"] = type
    if category:
        quiz_data["category"] = category
    if time_seconds:
        quiz_data["time_seconds"] = time_seconds

    stmt = (
        update(QuizQuestion)
        .values(quiz_data)
        .where(QuizQuestion.id == id)
        .returning(
            QuizQuestion.description,
            QuizQuestion.type,
            QuizQuestion.category,
            QuizQuestion.image_url,
        )
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
