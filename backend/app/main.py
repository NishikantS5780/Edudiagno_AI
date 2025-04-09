from fastapi import FastAPI, Depends
import openai
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv()

from app.config import settings

openai.api_key = settings.OPENAI_API_KEY
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

from . import models, crud, schemas
from .database import engine, Base, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)