from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Body
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import os
import shutil
import json
from pathlib import Path
import openai
from datetime import datetime
from pydantic import BaseModel
import tempfile
import logging
from dotenv import load_dotenv
import httpx
from utils.audio_utils import prepare_audio_file
from utils.file_utils import generate_unique_filename

from database import get_db
from models.models import User, Interview, InterviewQuestion, VideoResponse, Job, Candidate
from utils.auth import get_current_user
from utils.openai_utils import (
    transcribe_audio,
    analyze_video_response,
    generate_followup_question
)

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = Path("uploads/videos")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload-url")
async def get_video_upload_url(
    current_user: User = Depends(get_current_user)
):
    """Generate a URL for uploading a video (local development version)"""
    file_key = generate_unique_filename("videos", "mp4")
    local_path = UPLOAD_DIR / file_key
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    return {
        "upload_url": f"/api/videos/upload/{file_key}",
        "file_key": file_key,
        "video_url": f"/uploads/videos/{file_key}"
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
        
        return {"filename": file_path, "url": f"/uploads/videos/{file_path}"}
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

@router.post("/{question_id}/update-transcript")
async def update_transcript(
    question_id: int,
    transcript: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the transcript for a video response"""
    # Find the response
    response = db.query(VideoResponse).filter(
        VideoResponse.question_id == question_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No response found for this question"
        )
    
    # Update the transcript
    response.transcript = transcript
    response.was_edited = True
    db.commit()
    db.refresh(response)
    
    return {
        "id": response.id,
        "transcript": response.transcript,
        "was_edited": response.was_edited
    }

@router.post("/{question_id}/analyze")
async def analyze_response(
    question_id: int,
    video_url: str,
    transcript: str = Body(..., embed=True),
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
        existing_response.ai_feedback = analysis["formatted_feedback"]
        existing_response.analysis_data = json.dumps({
            "key_points": analysis.get("key_points", []),
            "strengths": analysis.get("strengths", []),
            "areas_to_improve": analysis.get("areas_to_improve", []),
            "red_flags": analysis.get("red_flags", []),
            "outstanding_qualities": analysis.get("outstanding_qualities", [])
        })
        db.commit()
        db.refresh(existing_response)
        response = existing_response
    else:
        response = VideoResponse(
            question_id=question_id,
            video_url=video_url,
            transcript=transcript,
            score=analysis["score"],
            ai_feedback=analysis["formatted_feedback"],
            analysis_data=json.dumps({
                "key_points": analysis.get("key_points", []),
                "strengths": analysis.get("strengths", []),
                "areas_to_improve": analysis.get("areas_to_improve", []),
                "red_flags": analysis.get("red_flags", []),
                "outstanding_qualities": analysis.get("outstanding_qualities", [])
            })
        )
        db.add(response)
        db.commit()
        db.refresh(response)
    
    return {
        "id": response.id,
        "score": response.score,
        "feedback": response.ai_feedback,
        "transcript": response.transcript,
        "analysis": json.loads(response.analysis_data) if response.analysis_data else {}
    }

@router.post("/{question_id}/follow-up")
async def get_followup_question(
    question_id: int,
    response_text: str = Body(..., embed=True),
    is_last_question: bool = Body(False, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a follow-up question or comment based on candidate response"""
    # Verify question exists
    question = db.query(InterviewQuestion).join(Interview).join(Job).filter(
        InterviewQuestion.id == question_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Get the job title
    job_title = question.interview.job.title if question.interview and question.interview.job else "this position"
    
    # Generate the follow-up
    follow_up = await generate_followup_question(
        question=question.question,
        response=response_text,
        job_title=job_title,
        is_last_question=is_last_question
    )
    
    return {
        "follow_up": follow_up
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
        "analysis": json.loads(response.analysis_data) if response.analysis_data else {},
        "was_edited": response.was_edited,
        "created_at": response.created_at
    }

@router.get("/transcript/{interview_id}")
async def get_full_transcript(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the full transcript for an interview"""
    # Verify interview exists
    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Get all questions for this interview
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id
    ).order_by(InterviewQuestion.order_number).all()
    
    # Get responses for each question
    transcript = []
    for question in questions:
        response = db.query(VideoResponse).filter(
            VideoResponse.question_id == question.id
        ).first()
        
        transcript.append({
            "question_id": question.id,
            "question": question.question,
            "order": question.order_number,
            "response_text": response.transcript if response else None,
            "score": response.score if response else None,
            "feedback": response.ai_feedback if response else None
        })
    
    return {
        "interview_id": interview_id,
        "transcript": transcript
    }
