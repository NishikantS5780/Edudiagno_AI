from io import BytesIO
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import update
from sqlalchemy.orm import Session

from app import database
from app.configs import openai
from app.dependencies.authorization import authorize_candidate
from app.models import InterviewQuestionAndResponse

router = APIRouter()


@router.post("/to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    if not audio_file.content_type or not (
        audio_file.content_type.startswith("audio/")
        or audio_file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an audio file."
        )

    if not audio_file.size or audio_file.size < 1000:
        return {"transcript": "no answer"}

    contents = await audio_file.read()
    audio_file_obj = BytesIO(contents)
    audio_file_obj.name = "audio.webm"

    result = await openai.client.audio.transcriptions.create(
        model="whisper-1", file=audio_file_obj, language="en"
    )

    if not result or not result.text:
        raise HTTPException(status_code=500, detail="Unable to comprehend, please re-record answer")

    return {"transcript": result.text}
