from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import database
from app.models import Country

router = APIRouter()


@router.get("")
async def get_country(keyword: str = "", db: Session = Depends(database.get_db)):
    stmt = (
        select(Country.id, Country.name, Country.currency)
        .where(Country.name.ilike(f"%{keyword}%"))
        .order_by(Country.name)
    )
    
    # Only apply limit when searching with a keyword
    if keyword:
        stmt = stmt.offset(0).limit(10)
    
    countries = db.execute(stmt).mappings().all()
    return countries
