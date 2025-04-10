import openai

from app.config import settings


client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
print("OpenAI client initialized successfully")
