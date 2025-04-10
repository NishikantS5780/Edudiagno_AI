import base64
import io
from fastapi import APIRouter, Body, File, HTTPException, UploadFile

from app import schemas
from app.configs import openai

router = APIRouter()


@router.post("/to-text")
async def text_to_speech(
    audio_file: UploadFile = File(...),
):
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    if not audio_file.content_type or not (
        audio_file.content_type.startswith("audio/")
        or audio_file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an audio file."
        )

    if not audio_file.size or audio_file.size == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    audio_file_obj = audio_file.file

    result = await openai.client.audio.transcriptions.create(
        model="whisper-1", file=audio_file_obj, language="en"
    )

    if not result or not result.text:
        raise HTTPException(status_code=500, detail="Failed to transcribe audio")

    return {"transcript": result.text}
