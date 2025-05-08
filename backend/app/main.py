import logging
from os import path
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import openai
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError

from app.lib.errors import CustomException

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
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
    expose_headers=["Authorization"],
    max_age=3600,
)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemy at {request.url.path}: {exc}")
    if "unique constraint" in exc.args[0]:
        column_name = exc.args[0].split("Key")[-1].split("=")[0].strip().strip("()")
        return JSONResponse(
            status_code=400,
            content={"detail": f"{column_name} already exists"},
        )
    elif "No row was found" in exc.args[0]:
        return JSONResponse(
            status_code=400,
            content={"detail": "Resource not found"},
        )
    elif "violates foreign key constraint" in exc.args[0]:
        table_name = exc.args[0].split("table")[-1].split('"')[1]
        return JSONResponse(
            status_code=400,
            content={"detail": f"{table_name} does not exist"},
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected database error."},
    )


@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(status_code=exc.code, content={"detail": exc.args[0]})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Something went wrong."})


from app.routes import (
    city,
    country,
    dsa_response,
    dsa_test_case,
    interview_question_and_response,
    quiz_option,
    quiz_question,
    quiz_response,
    recruiter,
    job,
    interview,
    resume,
    state,
    text,
    audio,
    dsa_question,
)

app.include_router(recruiter.router, prefix="/api/recruiter", tags=["Recruiter"])
app.include_router(job.router, prefix="/api/job", tags=["Job"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(
    interview_question_and_response.router,
    prefix="/api/interview-question-and-response",
    tags=["Interview Question"],
)
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(text.router, prefix="/api/text", tags=["Text"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(
    dsa_question.router, prefix="/api/dsa-question", tags=["DSA Question"]
)
app.include_router(
    dsa_test_case.router, prefix="/api/dsa-test-case", tags=["DSA Test Case"]
)
app.include_router(
    dsa_response.router, prefix="/api/dsa-response", tags=["DSA Response"]
)
app.include_router(
    quiz_question.router, prefix="/api/quiz-question", tags=["Quiz Question"]
)
app.include_router(quiz_option.router, prefix="/api/quiz-option", tags=["Quiz Option"])
app.include_router(
    quiz_response.router, prefix="/api/quiz-response", tags=["Quiz Response"]
)
app.include_router(country.router, prefix="/api/country", tags=["Country"])
app.include_router(state.router, prefix="/api/state", tags=["State"])
app.include_router(city.router, prefix="/api/city", tags=["City"])


@app.get("/api", tags=["Health"])
def read_root():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
