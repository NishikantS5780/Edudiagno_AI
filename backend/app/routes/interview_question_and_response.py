from io import BytesIO
import json
import tempfile
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, select, update

from app import database, schemas
from app.configs import openai
from app.dependencies.authorization import authorize_candidate
from app.models import Interview, InterviewQuestionAndResponse, Job

router = APIRouter()


@router.get("")
async def get_interview_question_and_response(
    request: Request, interview_id: str, db: Session = Depends(database.get_db)
):
    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == int(interview_id)
    )
    result = db.execute(stmt)
    interview_question_and_response = result.scalars().all()[0]
    return interview_question_and_response


@router.post("/generate-questions")
async def generate_questions(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == interview_id
        and InterviewQuestionAndResponse.answer == None
    )
    questions_and_responses = db.execute(stmt).scalars().all()
    if len(questions_and_responses):
        return questions_and_responses

    stmt = select(Interview).where(Interview.id == interview_id)
    interview = db.execute(stmt).scalars().all()[0]

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    stmt = select(Job).where(Job.id == interview.job_id)
    job = db.execute(stmt).scalars().all()[0]

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not interview.resume_text and not job.description:
        return [
            {
                "question": "Could you please tell me about your experience as a Senior Software Engineer?",
                "type": "general",
            }
        ]

    question_types = [
        "technical",
        "technical",
        "technical",
        "behavioral",
        "behavioral",
        "problem_solving",
        "problem_solving",
        "problem_solving",
    ]

    system_prompt = f"""You are an expert technical interviewer for the position of {job.title}.
Your task is to generate interview questions based on the job description and candidate's resume.

The questions should be:
1. Clear and concise
2. Relevant to the position
3. Based on the candidate's experience from their resume
4. Progressive in difficulty
5. Natural and conversational

Current question types: {', '.join(question_types)}
Maximum questions to generate: {len(question_types)}

Job Description:
{job.description}

Candidate's Resume:
{interview.resume_text}

{'For the first question, start with a brief greeting and then ask your first question. Format it as: "Hello! [Greeting message]. [Question]".'}

The question should be based on the previous conversation and maintain a natural flow.
If no resume text or job description is provided, generate a basic question about the candidate's experience.

Return the questions as a JSON array of objects with "question" and "type" fields."""

    response = await openai.client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate the interview questions."},
        ],
        temperature=0.7,
        max_tokens=1000,
    )

    questions = json.loads(response.choices[0].message.content)

    if not questions[0]["question"] or not questions[0]["type"]:
        raise HTTPException(status_code=500, detail="Error while generating questions")
    if not isinstance(questions, list):
        questions = [
            {"question": response.choices[0].message.content, "type": "general"}
        ]

    if not questions:
        raise HTTPException(status_code=500, detail="Failed to generate questions")

    interview_questions_and_responses = [
        InterviewQuestionAndResponse(
            question=question["question"],
            question_type=question["type"],
            order_number=index,
            interview_id=interview_id,
        )
        for index, question in enumerate(questions)
    ]

    db.add_all(interview_questions_and_responses)
    db.commit()

    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == interview_id
    )
    interview_questions_and_responses = db.execute(stmt).scalars().all()
    return interview_questions_and_responses


@router.put("/submit-text-response")
async def text_update_answer(
    data: schemas.UpdateInterviewQuestionResponse,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        update(InterviewQuestionAndResponse)
        .values(answer=data.answer)
        .where(
            and_(
                InterviewQuestionAndResponse.interview_id == interview_id,
                InterviewQuestionAndResponse.order_number == data.question_order,
                InterviewQuestionAndResponse.answer.is_(None),
            )
        )
        .returning(
            InterviewQuestionAndResponse.question,
            InterviewQuestionAndResponse.question_type,
            InterviewQuestionAndResponse.order_number,
            InterviewQuestionAndResponse.answer,
        )
    )
    result = db.execute(stmt)
    db.commit()
    questions_and_responses = result.all()

    if len(questions_and_responses) < 1:
        raise HTTPException(status_code=500, detail="no unanswered question found")

    question_and_response = questions_and_responses[0]._mapping

    return question_and_response
