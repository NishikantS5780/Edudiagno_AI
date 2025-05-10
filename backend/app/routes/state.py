from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app import database
from app.models import Country, State

router = APIRouter()


@router.get("")
async def get_state(
    country_id: str = None,
    keyword: str = "",
    db: Session = Depends(database.get_db),
):
    filters = [State.name.ilike(f"%{keyword}%")]
    if country_id:
        filters.append(
            State.country_id == country_id,
        )

    stmt = (
        select(State.id, State.name, Country.currency)
        .join(Country)
        .where(and_(*filters))
        .order_by(State.name)
        .offset(0)
        .limit(10)
    )
    states = db.execute(stmt).mappings().all()
    return states
