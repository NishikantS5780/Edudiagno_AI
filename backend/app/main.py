import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import openai
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)  # or DEBUG in dev

from app.config import settings

openai.api_key = settings.OPENAI_API_KEY
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

from .database import engine, Base

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="EduDiagnoAI API",
    description="API for EduDiagnoAI, an AI-powered interview platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemy error at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected database error."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Something went wrong."})


from app.routes import (
    interview_question_and_response,
    recruiter,
    job,
    interview,
    resume,
    text,
    audio,
)

app.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
app.include_router(job.router, prefix="/job", tags=["Job"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(
    interview_question_and_response.router,
    prefix="/interview-question-and-response",
    tags=["Interview Question"],
)
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(text.router, prefix="/text", tags=["Text"])
app.include_router(audio.router, prefix="/audio", tags=["Audio"])


@app.get("/", tags=["Health"])
def read_root():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
