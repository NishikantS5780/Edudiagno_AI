import logging
from io import BytesIO
import asyncio
import io
import openai
from config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def prepare_audio_file(audio_content: bytes, filename: str) -> tuple[bytes, str]:
    """Prepare audio file for OpenAI's Whisper API"""
    try:
        # Ensure filename has correct extension
        if not filename.endswith('.webm'):
            filename = 'audio.webm'
        
        # Debug logging
        logger.info(f"Prepared audio file: {filename}")
        logger.info(f"File size: {len(audio_content)} bytes")
        
        # Create a file-like object with the filename
        audio_file = io.BytesIO(audio_content)
        audio_file.name = filename
        
        return audio_file, filename
    except Exception as e:
        logger.error(f"Error preparing audio file: {str(e)}")
        raise

async def transcribe_audio(audio_blob: bytes, filename: str) -> str:
    """Transcribe audio using OpenAI's Whisper model"""
    try:
        # Create a temporary file-like object
        audio_file = io.BytesIO(audio_blob)
        audio_file.name = filename
        
        # Send to Whisper for transcription
        result = await openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en"
        )
        
        if not result or not result.text:
            logger.error("No transcription result received from OpenAI")
            return None
            
        return result.text
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        return None 