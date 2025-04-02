
# EduDiagno Integration Guide

This document provides a comprehensive guide for implementing the backend services required by the EduDiagno platform using FastAPI and PostgreSQL.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Service Implementation](#service-implementation)
5. [OpenAI Integration](#openai-integration)
6. [Deployment Guidelines](#deployment-guidelines)

## Architecture Overview

EduDiagno is a platform for AI-powered educational diagnostics and interviews. The frontend is built with React, and the backend should be implemented using FastAPI and PostgreSQL. The system requires services for:

- User authentication and authorization
- Job posting management
- Candidate resume processing and analysis
- Interview scheduling, recording, and evaluation
- Analytics and reporting

## Database Schema

Here's a recommended database schema for EduDiagno:

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    company_logo VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'employer',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    show_salary BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Job Interview Settings Table
```sql
CREATE TABLE job_interview_settings (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    include_technical BOOLEAN NOT NULL DEFAULT TRUE,
    include_behavioral BOOLEAN NOT NULL DEFAULT TRUE,
    include_problem_solving BOOLEAN NOT NULL DEFAULT TRUE,
    include_custom_questions BOOLEAN NOT NULL DEFAULT FALSE,
    custom_questions JSONB,
    preparation_time INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Candidates Table
```sql
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    resume_url VARCHAR(255),
    resume_text TEXT,
    resume_match_score FLOAT,
    resume_match_feedback TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Interviews Table
```sql
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    interview_url VARCHAR(255) NOT NULL,
    access_code VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    overall_score FLOAT,
    feedback TEXT,
    recording_url VARCHAR(255),
    interview_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Interview Questions Table
```sql
CREATE TABLE interview_questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Interview Responses Table
```sql
CREATE TABLE interview_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES interview_questions(id) ON DELETE CASCADE,
    response_text TEXT,
    transcribed_audio TEXT,
    audio_url VARCHAR(255),
    score FLOAT,
    feedback TEXT,
    duration INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## API Endpoints

The following API endpoints should be implemented:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Jobs
- `GET /api/jobs` - List jobs with pagination
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/{job_id}` - Get job details
- `PUT /api/jobs/{job_id}` - Update job
- `DELETE /api/jobs/{job_id}` - Delete job
- `POST /api/jobs/{job_id}/interview-settings` - Create/update interview settings

### Candidates
- `GET /api/jobs/{job_id}/candidates` - List candidates for a job
- `POST /api/jobs/{job_id}/candidates` - Add candidate to a job
- `GET /api/candidates/{candidate_id}` - Get candidate details
- `PUT /api/candidates/{candidate_id}` - Update candidate
- `DELETE /api/candidates/{candidate_id}` - Delete candidate
- `POST /api/candidates/{candidate_id}/analyze-resume` - Analyze resume match

### Interviews
- `GET /api/interviews` - List interviews with pagination
- `POST /api/jobs/{job_id}/interviews` - Create new interview
- `GET /api/interviews/{interview_id}` - Get interview details
- `GET /api/interviews/access/{access_code}` - Get interview by access code
- `POST /api/interviews/{interview_id}/start` - Start interview
- `POST /api/interviews/{interview_id}/complete` - Complete interview
- `POST /api/interviews/{interview_id}/responses` - Save interview response
- `GET /api/interviews/{interview_id}/report` - Generate interview report

### AI Services
- `POST /api/ai/generate-job-description` - Generate job description with AI
- `POST /api/ai/generate-interview-questions` - Generate interview questions
- `POST /api/ai/evaluate-response` - Evaluate candidate response
- `POST /api/ai/transcribe-audio` - Transcribe interview audio
- `POST /api/ai/parse-resume` - Parse resume text from PDF

## Service Implementation

### Authentication Service

Use FastAPI's security utilities with JWT tokens for authentication. For example:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 with Password flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Function to verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Function to hash password
def get_password_hash(password):
    return pwd_context.hash(password)

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Function to get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = await get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user
```

### Resume Processing Service

Implement resume processing using PDFPlumber and OpenAI:

```python
import pdfplumber
import openai
from fastapi import UploadFile, File

async def parse_resume_pdf(file: UploadFile = File(...)):
    # Save file temporarily
    file_location = f"temp/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())
    
    # Extract text from PDF
    resume_text = ""
    with pdfplumber.open(file_location) as pdf:
        for page in pdf.pages:
            resume_text += page.extract_text()
    
    return resume_text

async def analyze_resume_match(resume_text: str, job_description: str, job_requirements: str):
    # Use OpenAI to analyze the match
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert HR assistant that evaluates how well a candidate's resume matches a job description."},
            {"role": "user", "content": f"""
                Analyze how well the following resume matches the job description and requirements. 
                Provide a match percentage (0-100) and detailed feedback.
                
                Job Description:
                {job_description}
                
                Job Requirements:
                {job_requirements}
                
                Resume:
                {resume_text}
            """}
        ],
        temperature=0.3,
    )
    
    result = response.choices[0].message.content
    
    # Parse the result to extract match percentage and feedback
    # This requires parsing the AI response format, which may vary
    
    return {
        "match": match_percentage,  # Extracted from AI response
        "feedback": feedback_text   # Extracted from AI response
    }
```

### Interview Service

Implement interview question generation and response evaluation:

```python
async def generate_interview_questions(job_title: str, job_description: str, resume_text: str, question_types: list):
    # Use OpenAI to generate appropriate questions
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert interviewer who creates targeted interview questions based on job requirements and candidate experience."},
            {"role": "user", "content": f"""
                Generate interview questions for a {job_title} position.
                
                Job Description:
                {job_description}
                
                Candidate Resume:
                {resume_text}
                
                Include question types: {', '.join(question_types)}
                
                Format each question as a JSON object with "question" and "type" fields.
            """}
        ],
        temperature=0.7,
    )
    
    # Parse the AI response to extract questions
    questions = parse_questions_from_response(response.choices[0].message.content)
    
    return questions

async def evaluate_interview_response(question: str, response: str, job_description: str):
    # Use OpenAI to evaluate the response
    ai_response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert interviewer who evaluates candidate responses objectively."},
            {"role": "user", "content": f"""
                Evaluate the following candidate response to an interview question.
                Provide a score from 0-100 and detailed feedback.
                
                Job Description:
                {job_description}
                
                Question:
                {question}
                
                Candidate Response:
                {response}
            """}
        ],
        temperature=0.3,
    )
    
    # Parse the AI response to extract score and feedback
    evaluation = parse_evaluation_from_response(ai_response.choices[0].message.content)
    
    return evaluation
```

### Audio Transcription Service

Implement audio transcription using OpenAI's Whisper API:

```python
async def transcribe_audio(audio_file: UploadFile = File(...)):
    # Save file temporarily
    file_location = f"temp/{audio_file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(await audio_file.read())
    
    # Transcribe audio using OpenAI Whisper
    with open(file_location, "rb") as audio:
        transcript = openai.Audio.transcribe("whisper-1", audio)
    
    return transcript.text
```

## OpenAI Integration

To integrate OpenAI services, you'll need to:

1. Set up environment variables for your OpenAI API key
2. Create helper functions for different AI tasks

```python
import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Define AI service functions
class AIService:
    @staticmethod
    def generate_job_description(title, department, location):
        prompt = f"Create a professional job description for a {title} position in the {department} department. The position is {location}."
        
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant specializing in creating compelling job descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    
    @staticmethod
    def transcribe_audio(audio_file_path):
        with open(audio_file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        return transcript.text
```

## Deployment Guidelines

For deploying the FastAPI backend:

1. Set up a PostgreSQL database (AWS RDS, DigitalOcean, or other providers)
2. Deploy the FastAPI application using Docker containers
3. Set up a reverse proxy (Nginx) with HTTPS
4. Configure CORS to allow requests from your frontend domain
5. Set up environment variables for all sensitive information
6. Implement proper logging and monitoring
7. Set up database backups and recovery procedures

Docker Compose example:

```yaml
version: '3'

services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/edudiagno
      - SECRET_KEY=${SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads
  
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_USER=postgres
      - POSTGRES_DB=edudiagno
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Workflow Integration

To fully integrate the frontend with your FastAPI backend:

1. Update API endpoint URLs in the frontend to point to your FastAPI server
2. Implement error handling for API responses
3. Set up authentication token storage and refresh logic
4. Update file upload logic to work with your backend endpoints
5. Test the complete workflow from job creation to interview completion

This concludes the basic integration guide. For more detailed implementation instructions or assistance with specific features, please consult the project's technical lead.
