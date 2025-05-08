from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app import database
from app.models import City

router = APIRouter()


@router.get("")
async def get_city(
    country_id: str = None,
    state_id: str = None,
    keyword: str = "",
    db: Session = Depends(database.get_db),
):
    filters = [City.name.ilike(f"%{keyword}%")]
    if country_id:
        filters.append(City.country_id == country_id)
    if state_id:
        filters.append(City.state_id == state_id)

    stmt = (
        select(City.id, City.name)
        .where(and_(*filters))
        .order_by(City.name)
        .offset(0)
        .limit(10)
    )
    cities = db.execute(stmt).mappings().all()
    return cities
