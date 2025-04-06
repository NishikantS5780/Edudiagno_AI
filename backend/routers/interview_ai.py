import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Union, Dict
import openai
from datetime import datetime
from pydantic import BaseModel
import os
import tempfile
import logging
from dotenv import load_dotenv
import httpx
from utils.audio_utils import prepare_audio_file
from database import get_db
from models.models import Interview, InterviewQuestion, Candidate, Job
from utils.openai_utils import (
    generate_interview_questions,
    process_interview_response,
    evaluate_interview_response,
    analyze_video_response,
    generate_followup_question,
    text_to_speech
)
import asyncio
import io

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = openai.AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.AsyncClient()
)

# Create audio directory if it doesn't exist
AUDIO_DIR = "audio_files"
os.makedirs(AUDIO_DIR, exist_ok=True)

router = APIRouter()

class GenerateQuestionRequest(BaseModel):
    job_description: str
    resume_text: str
    question_types: List[str]
    max_questions: int
    interview_id: int
    conversation_history: Optional[List[dict]] = None

class ProcessResponseRequest(BaseModel):
    response: str
    interviewId: Union[str, int]
    conversationHistory: List[Dict[str, str]]

    class Config:
        json_schema_extra = {
            "example": {
                "response": "My response to the question",
                "interviewId": "123",
                "conversationHistory": [
                    {"role": "assistant", "content": "Tell me about your experience"},
                    {"role": "user", "content": "I have worked on several projects"}
                ]
            }
        }
        alias_generator = lambda x: x  # Disable automatic snake_case conversion

class TTSRequest(BaseModel):
    text: str

@router.post("/generate-question")
def generate_question(
    job_description: str = Body(...),
    resume_text: str = Body(...),
    question_types: List[str] = Body(...),
    max_questions: int = Body(...),
    interview_id: Union[str, int] = Body(...),
    conversation_history: Optional[List[dict]] = Body(default=None),
    db: Session = Depends(get_db)
):
    """Generate the next interview question"""
    try:
        logger.info(f"Generating question for interview {interview_id}")
        
        # Convert interview_id to string if it's an integer
        interview_id_str = str(interview_id)
        
        # Get interview details
        interview = db.query(Interview).filter(Interview.id == interview_id_str).first()
        if not interview:
            logger.error(f"Interview not found: {interview_id_str}")
            raise HTTPException(status_code=404, detail="Interview not found")

        job = db.query(Job).filter(Job.id == interview.job_id).first()
        if not job:
            logger.error(f"Job not found for interview {interview_id_str}")
            raise HTTPException(status_code=404, detail="Job not found")

        candidate = db.query(Candidate).filter(Candidate.id == interview.candidate_id).first()
        if not candidate:
            logger.error(f"Candidate not found for interview {interview_id_str}")
            raise HTTPException(status_code=404, detail="Candidate not found")

        logger.info(f"Generating questions for job: {job.title}")
        # Generate question
        questions = generate_interview_questions(
            job_title=job.title,
            job_description=job_description,
            resume_text=resume_text,
            question_types=question_types,
            max_questions=max_questions,
            conversation_history=conversation_history
        )

        if not questions:
            logger.error("No questions generated")
            raise HTTPException(status_code=500, detail="Failed to generate questions")

        logger.info(f"Successfully generated {len(questions)} questions")
        return questions  # Return first question only
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate question: {str(e)}"
        )

@router.post("/process-response")
def process_response(
    request: ProcessResponseRequest,
    db: Session = Depends(get_db)
):
    """Process the candidate's response"""
    try:
        # Convert interview_id to string if it's an integer
        interview_id_str = str(request.interviewId)
        
        # Get interview details
        interview = db.query(Interview).filter(Interview.id == interview_id_str).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        job = db.query(Job).filter(Job.id == interview.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        candidate = db.query(Candidate).filter(Candidate.id == interview.candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Process response
        result = process_interview_response(
            response=request.response,
            job_title=job.title,
            job_description=job.description,
            resume_text=candidate.resume_text,
            conversation_history=request.conversationHistory
        )

        return {"nextQuestion": result}
    except Exception as e:
        print(f"Error processing response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-response")
def evaluate_response(
    question: str = Body(...),
    response_text: str = Body(...),
    interview_id: Union[str, int] = Body(...),
    db: Session = Depends(get_db)
):
    """Evaluate the candidate's response"""
    try:
        # Convert interview_id to string if it's an integer
        interview_id_str = str(interview_id)
        
        # Get interview details
        interview = db.query(Interview).filter(Interview.id == interview_id_str).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        job = db.query(Job).filter(Job.id == interview.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Evaluate response
        result = evaluate_interview_response(
            question=question,
            response_text=response_text,
            job_title=job.title
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe-audio")
def transcribe_audio(
    audio_blob: bytes = Body(...),
    filename: str = Body(default="audio.webm")
):
    """Transcribe audio from blob"""
    try:
        result = transcribe_audio_from_blob(audio_blob, filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-video")
def analyze_video(
    question: str = Body(...),
    transcript: str = Body(...),
    interview_id: Union[str, int] = Body(...),
    db: Session = Depends(get_db)
):
    """Analyze video response"""
    try:
        # Convert interview_id to string if it's an integer
        interview_id_str = str(interview_id)
        
        # Get interview details
        interview = db.query(Interview).filter(Interview.id == interview_id_str).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        job = db.query(Job).filter(Job.id == interview.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Analyze video
        result = analyze_video_response(
            question=question,
            transcript=transcript,
            job_description=job.description
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-followup")
def generate_followup(
    question: str = Body(...),
    response: str = Body(...),
    interview_id: Union[str, int] = Body(...),
    is_last_question: bool = Body(default=False),
    db: Session = Depends(get_db)
):
    """Generate follow-up question"""
    try:
        # Convert interview_id to string if it's an integer
        interview_id_str = str(interview_id)
        
        # Get interview details
        interview = db.query(Interview).filter(Interview.id == interview_id_str).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        job = db.query(Job).filter(Job.id == interview.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate follow-up
        result = generate_followup_question(
            question=question,
            response=response,
            job_title=job.title,
            is_last_question=is_last_question
        )
        
        return {"followup": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Transcribe audio using OpenAI's Whisper model"""
    try:
        logger.info(f"Received audio file: {audio_file.filename}")
        logger.info(f"Content type: {audio_file.content_type}")
        logger.info(f"Content length: {audio_file.size} bytes")
        
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        if not audio_file.content_type or not (audio_file.content_type.startswith('audio/') or audio_file.content_type == 'application/octet-stream'):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")
            
        if not audio_file.size or audio_file.size == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")
            
        # Read the audio content
        audio_content = await audio_file.read()
        
        # Create a file-like object with the filename
        audio_file_obj = io.BytesIO(audio_content)
        audio_file_obj.name = audio_file.filename
        
        # Send to Whisper for transcription
        result = await openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file_obj,
            language="en"
        )
        
        if not result or not result.text:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio")
            
        # Log the transcription result
        logger.info(f"Transcription result: {result.text}")
            
        return {"transcript": result.text}
        
    except Exception as e:
        logger.error(f"Error in transcribe endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/tts")
# async def text_to_speech(request: TTSRequest):
#     try:
#         response = openai_client.audio.speech.create(
#             model="tts-1",
#             voice="alloy",
#             input=request.text
#         )
        
#         # Save the audio file in the audio directory
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         audio_filename = f"temp_audio_{timestamp}.mp3"
#         audio_path = os.path.join(AUDIO_DIR, audio_filename)
#         response.stream_to_file(audio_path)
        
#         return {"audio_url": f"/audio/{audio_filename}"}
#     except Exception as e:
#         logger.error(f"Error in text-to-speech: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}") 