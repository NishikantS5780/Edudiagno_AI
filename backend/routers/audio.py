import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils import openai_utils

router = APIRouter()

class TextToSpeechData(BaseModel):
    text: str

@router.post("/text-to-speech")
async def text_to_speech(text_to_speech_data: TextToSpeechData):
    try:
        speech_file = openai_utils.text_to_speech(text=text_to_speech_data.text)
        audio_base64 = ""
        if speech_file:
            audio_base64 = base64.b64encode(speech_file.read()).decode("utf-8")

        return {"audio_base64": audio_base64}
    except Exception:
        raise HTTPException(status_code=500, detail="unexpected error occurred")
