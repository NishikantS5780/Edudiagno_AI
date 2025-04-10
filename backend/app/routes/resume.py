import json
from fastapi import APIRouter, File, Request, UploadFile
from pypdf import PdfReader

from app.configs import openai

router = APIRouter()


@router.post("/parse")
async def parse_resume(request: Request, file: UploadFile = File(...)):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided"
        )

    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    if not text:
        raise ValueError("No text could be extracted from the PDF")

    prompt = f"""Extract the following structured information from this resume text.
    Return ONLY a JSON object with these exact fields (all fields should be strings, arrays should not be empty):
    {{
        "name": "Full name",
        "email": "Email address",
        "phone": "Phone number",
        "location": "Location/City",
        "resume_text": "Full resume text",
        "work_experience": ["List of work experiences"],
        "education": ["List of education details"],
        "skills": {{
            "technical": ["List of technical skills"],
            "soft": ["List of soft skills"]
        }}
    }}

    Resume text:
    {text}

    Important:
    - Return ONLY the JSON object, no other text
    - All fields must be present
    - Arrays should not be empty (use empty string if no data)
    - All values must be strings
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that extracts structured information from resumes. You must return a valid JSON object.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    resume_data = json.loads(response.choices[0].message.content)
    return resume_data
