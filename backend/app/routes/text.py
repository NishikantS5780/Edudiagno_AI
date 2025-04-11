import base64
import io
from fastapi import APIRouter

from app import schemas
from app.configs import openai

router = APIRouter()


@router.post("/to-speech")
async def text_to_speech(text_to_speech_data: schemas.TextToSpeech):
    async with openai.client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="ash",
        input=text_to_speech_data.text,
        instructions="Speak as an interviewer",
    ) as response:

        speech_file = io.BytesIO()

        async for chunk in response.iter_bytes():
            speech_file.write(chunk)

        speech_file.seek(0)

        audio_base64 = ""
        if speech_file:
            audio_base64 = base64.b64encode(speech_file.read()).decode("utf-8")

        return {"audio_base64": audio_base64}
