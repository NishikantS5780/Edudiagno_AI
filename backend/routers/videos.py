from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from pathlib import Path

from database import get_db
from models.models import User, Interview, InterviewQuestion, VideoResponse, Job
from utils.auth import get_current_user
from utils.s3 import generate_presigned_url, generate_unique_filename, get_presigned_download_url
from utils.openai_utils import transcribe_audio, analyze_video_response

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload-url")
async def get_video_upload_url(
    current_user: User = Depends(get_current_user)
):
    """Generate a URL for uploading a video (local development version)"""
    file_key = generate_unique_filename("videos", "mp4")
    upload_url = generate_presigned_url(file_key)
    
    # Create local path
    local_path = UPLOAD_DIR / file_key
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    return {
        "upload_url": upload_url,
        "file_key": file_key,
        "video_url": f"/uploads/{file_key}"
    }

@router.post("/upload/{file_path:path}")
async def upload_file(
    file_path: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Handle direct file uploads for local development"""
    try:
        # Create destination directory if it doesn't exist
        full_path = UPLOAD_DIR / file_path
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Save uploaded file
        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"filename": file_path, "url": f"/uploads/{file_path}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not upload file: {str(e)}"
        )

@router.post("/{question_id}/response")
async def submit_video_response(
    question_id: int,
    video_url: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a video response for an interview question"""
    # Verify question belongs to user's company
    question = db.query(InterviewQuestion).join(Interview).join(Job).filter(
        InterviewQuestion.id == question_id,
        Job.company_id == current_user.id
    ).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if a response already exists
    existing_response = db.query(VideoResponse).filter(
        VideoResponse.question_id == question_id
    ).first()
    
    if existing_response:
        # Update existing response
        existing_response.video_url = video_url
        db.commit()
        db.refresh(existing_response)
        response = existing_response
    else:
        # Create new response
        response = VideoResponse(
            question_id=question_id,
            video_url=video_url
        )
        db.add(response)
        db.commit()
        db.refresh(response)
    
    return {
        "id": response.id,
        "video_url": response.video_url
    }

@router.post("/{question_id}/analyze")
async def analyze_response(
    question_id: int,
    video_url: str,
    transcript: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a video response and provide feedback"""
    # Verify question belongs to user's company
    question_query = db.query(InterviewQuestion).join(Interview).join(Job)
    question = question_query.filter(
        InterviewQuestion.id == question_id,
        Job.company_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Get the job description for context
    job = db.query(Job).join(Interview).filter(
        Interview.id == question.interview_id
    ).first()
    
    # For local development without audio extraction, just use the transcript
    if not transcript:
        transcript = "This is a placeholder transcript. In production, the video would be transcribed using OpenAI's Whisper API."
    
    # Analyze the response
    analysis = await analyze_video_response(
        question=question.question,
        transcript=transcript,
        job_description=job.description if job else ""
    )
    
    # Update or create response in database
    existing_response = db.query(VideoResponse).filter(
        VideoResponse.question_id == question_id
    ).first()
    
    if existing_response:
        existing_response.transcript = transcript
        existing_response.score = analysis["score"]
        existing_response.ai_feedback = analysis["feedback"]
        db.commit()
        db.refresh(existing_response)
        response = existing_response
    else:
        response = VideoResponse(
            question_id=question_id,
            video_url=video_url,
            transcript=transcript,
            score=analysis["score"],
            ai_feedback=analysis["feedback"]
        )
        db.add(response)
        db.commit()
        db.refresh(response)
    
    return {
        "id": response.id,
        "score": response.score,
        "feedback": response.ai_feedback,
        "transcript": response.transcript
    }

@router.get("/{question_id}/responses")
async def get_response(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get responses for a question"""
    # Verify question belongs to user's company
    question = db.query(InterviewQuestion).join(Interview).join(Job).filter(
        InterviewQuestion.id == question_id,
        Job.company_id == current_user.id
    ).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    response = db.query(VideoResponse).filter(
        VideoResponse.question_id == question_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No response found for this question"
        )
    
    return {
        "id": response.id,
        "video_url": response.video_url,
        "transcript": response.transcript,
        "score": response.score,
        "feedback": response.ai_feedback,
        "created_at": response.created_at
    }
