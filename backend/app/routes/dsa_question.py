from fastapi import APIRouter, Depends
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database
from app import schemas
from app.dependencies.authorization import authorize_recruiter
from app.models import DSAQuestion, DSATestCase

router = APIRouter()


@router.post("")
async def create_dsa_question(
    dsa_question_data: schemas.CreateDSAQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    dsa_question = DSAQuestion(
        title=dsa_question_data.title,
        description=dsa_question_data.description,
        difficulty=dsa_question_data.difficulty,
        time_minutes=dsa_question_data.time_minutes,
        job_id=dsa_question_data.job_id,
    )
    db.add(dsa_question)
    db.commit()
    db.refresh(dsa_question)

    return dsa_question


@router.get("")
async def get_dsa_question(job_id: str, db: Session = Depends(database.get_db)):
    stmt = select(
        DSAQuestion.id,
        DSAQuestion.title,
        DSAQuestion.description,
        DSAQuestion.difficulty,
        DSAQuestion.time_minutes,
    ).where(DSAQuestion.job_id == int(job_id))
    result = db.execute(stmt)
    dsa_questions = result.mappings().all()
    return dsa_questions


@router.put("")
async def update_dsa_question(
    dsa_question_data: schemas.UpdateDSAQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    dsa_question_data = dsa_question_data.model_dump(exclude_unset=True)
    dsa_question_id = dsa_question_data.pop("id", None)
    stmt = (
        update(DSAQuestion)
        .values(dsa_question_data)
        .where(DSAQuestion.id == dsa_question_id)
        .returning(
            DSAQuestion.id,
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
        )
    )
    result = db.execute(stmt)
    dsa_question = result.mappings().one()
    db.commit()
    return dsa_question


@router.delete("")
async def delete_dsa_question(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_recruiter),
):
    stmt = delete(DSAQuestion).where(DSAQuestion.id == int(id))
    db.execute(stmt)
    db.commit()
    return {"message": "succesfully deleted dsa question"}
