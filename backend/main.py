from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from pathlib import Path
import openai

from models import models
from database import engine, get_db
from routers import users, jobs, candidates, interviews, auth, videos, interview_ai, audio
from config import settings

# Load environment variables
load_dotenv()

# Initialize OpenAI
openai.api_key = settings.OPENAI_API_KEY
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="EduDiagnoAI API",
    description="API for EduDiagnoAI, an AI-powered interview platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly list allowed methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Expose all headers to the client
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(interview_ai.router, prefix="/api/interview-ai", tags=["Interview AI"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])

# Root endpoint for health check
@app.get("/", tags=["Health"])
def read_root():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
