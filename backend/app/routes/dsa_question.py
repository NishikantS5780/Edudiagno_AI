from fastapi import APIRouter, Depends
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database
from app import schemas
from app.models import DSAQuestion, DSATestCase

router = APIRouter()


@router.post("")
async def create_dsa_question(
    dsa_question_data: schemas.CreateDSAQuestion, db: Session = Depends(database.get_db)
):
    dsa_question = DSAQuestion(
        title=dsa_question_data.title,
        description=dsa_question_data.description,
        difficulty=dsa_question_data.difficulty,
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
    ).where(DSAQuestion.job_id == int(job_id))
    result = db.execute(stmt)
    dsa_questions = result.all()
    return [dsa_question._mapping for dsa_question in dsa_questions]


@router.put("")
async def update_dsa_question(
    dsa_question_data: schemas.UpdateDSAQuestion, db: Session = Depends(database.get_db)
):
    stmt = (
        update(DSAQuestion)
        .values(
            title=dsa_question_data.title,
            description=dsa_question_data.description,
            difficulty=dsa_question_data.difficulty,
        )
        .where(DSAQuestion.id == dsa_question_data.id)
        .returning(DSAQuestion.id, DSAQuestion.description)
    )
    result = db.execute(stmt)
    dsa_question = result.all()[0]._mapping
    db.commit()
    return dsa_question


@router.delete("")
async def delete_dsa_question(id: str, db: Session = Depends(database.get_db)):
    stmt = delete(DSAQuestion).where(DSAQuestion.id == int(id))
    db.execute(stmt)
    db.commit()
    return {"message": "succesfully deleted dsa question"}
