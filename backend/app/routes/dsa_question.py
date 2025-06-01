from fastapi import APIRouter, Depends
from sqlalchemy import delete, insert, select, update
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
    stmt = (
        insert(DSAQuestion)
        .values(
            title=dsa_question_data.title,
            description=dsa_question_data.description,
            difficulty=dsa_question_data.difficulty,
            time_minutes=dsa_question_data.time_minutes,
            job_id=dsa_question_data.job_id,
        )
        .returning(
            DSAQuestion.id,
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
            DSAQuestion.job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    dsa_question = result.mappings().one()

    data = dict(dsa_question)
    data["test_cases"] = []

    for test_case in dsa_question_data.test_cases:
        dsa_test_case = DSATestCase(
            input=test_case.input,
            expected_output=test_case.expected_output,
            dsa_question_id=test_case.dsa_question_id,
        )
        stmt = (
            insert(DSATestCase)
            .values(
                input=test_case.input,
                expected_output=test_case.expected_output,
                dsa_question_id=test_case.dsa_question_id,
            )
            .returning(
                DSATestCase.id,
                DSATestCase.input,
                DSATestCase.expected_output,
                DSATestCase.dsa_question_id,
            )
        )
        result = db.execute(stmt)
        db.commit()
        dsa_test_case = result.mappings().one()
        data["test_cases"].append(dict(dsa_test_case))
    return data


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
