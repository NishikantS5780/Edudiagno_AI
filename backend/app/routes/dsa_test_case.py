from fastapi import APIRouter, Depends
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app import database, schemas
from app.models import DSATestCase

router = APIRouter()


@router.post("")
async def create_test_case(
    test_case_data: schemas.CreateDSATestCase, db: Session = Depends(database.get_db)
):
    dsa_test_case = DSATestCase(
        input=test_case_data.input,
        expected_output=test_case_data.expected_output,
        dsa_question_id=test_case_data.dsa_question_id,
    )
    db.add(dsa_test_case)
    db.commit()
    db.refresh(dsa_test_case)
    return dsa_test_case


@router.get("")
async def get_test_case(question_id: str, db: Session = Depends(database.get_db)):
    stmt = select(DSATestCase.id, DSATestCase.input, DSATestCase.expected_output).where(
        DSATestCase.dsa_question_id == int(question_id)
    )
    test_cases = db.execute(stmt).all()
    return [test_case._mapping for test_case in test_cases]


@router.put("")
async def update_test_case(
    test_case_data: schemas.UpdateDSATestCase, db: Session = Depends(database.get_db)
):
    stmt = (
        update(DSATestCase)
        .values(
            input=test_case_data.input, expected_output=test_case_data.expected_output
        )
        .where(DSATestCase.id == test_case_data.id)
        .returning(
            DSATestCase.id,
            DSATestCase.input,
            DSATestCase.expected_output,
            DSATestCase.dsa_question_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    test_case = result.all()[0]._mapping
    return test_case


@router.delete("")
async def delete_test_case(id: str, db: Session = Depends(database.get_db)):
    stmt = delete(DSATestCase).where(DSATestCase.id == id)
    db.execute(stmt)
    db.commit()
    return {"message": "successfully deleted test case"}
