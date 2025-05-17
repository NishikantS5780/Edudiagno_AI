from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import database, schemas
from app.dependencies.authorization import authorize_candidate, authorize_recruiter
from app.models import QuizResponse

router = APIRouter()


@router.post("")
async def create_quiz_response(
    quiz_responses: list[schemas.CreateQuizResponse],
    interview_id=Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    quiz_responses = [
        QuizResponse(
            interview_id=interview_id,
            question_id=response.question_id,
            option_id=response.option_id,
        )
        for response in quiz_responses
    ]
    db.add_all(quiz_responses)
    db.commit()
    for quiz_response in quiz_responses:
        db.refresh(quiz_response)

    return quiz_responses


@router.get("/recruiter-view")
async def get_quiz_response_recruiter_view(
    interview_id: str,
    recruiter_id=Depends(authorize_recruiter),
    db: Session = Depends(database.get_db),
):
    stmt = select(QuizResponse).where(QuizResponse.interview_id == int(interview_id))
    responses = db.execute(stmt).scalars().all()
    return [
        {
            "question_id": response.question_id,
            "option_id": response.option_id,
            "interview_id": response.interview_id
        }
        for response in responses
    ]
