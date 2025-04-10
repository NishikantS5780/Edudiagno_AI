from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app import database, schemas
from app.models import InterviewQuestionAndResponse

router = APIRouter()


@router.get("/{id}")
async def get_interview_question_and_response(
    request: Request, id: str, db: Session = Depends(database.get_db)
):
    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.id == int(id)
    )
    result = db.execute(stmt)
    interview_question_and_response = result.scalars().all()[0]
    return interview_question_and_response


@router.post("")
async def create_interview(
    request: Request,
    interview_question_and_response_data: schemas.CreateInterviewQuestionAndResponse,
    db: Session = Depends(database.get_db),
):
    interview_question_and_response = InterviewQuestionAndResponse(
        question=interview_question_and_response_data.question,
        question_type=interview_question_and_response_data.question_type,
        order_number=interview_question_and_response_data.order_number,
        answer=interview_question_and_response_data.answer,
        interview_id=interview_question_and_response_data.interview_id,
    )
    db.add(interview_question_and_response)
    db.commit()
    db.refresh(interview_question_and_response)
    return interview_question_and_response
