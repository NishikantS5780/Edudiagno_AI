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

    prompt = f"""Extract the following structured information from this resume text.  
    Return ONLY a JSON object with these exact fields (all fields should be strings, arrays if the data is not present in resume assign those fields null):

    ```json
    {{
        "first_name": "First name",
        "last_name": "Last name",
        "email": "Email address",
        "phone": "Phone number",
        "location": "Location or City or state",
        "linkedin_url": "LinkedIn profile URL",
        "portfolio_url": "Portfolio URL",
        "resume_text": "Full resume text",
        "work_experience": years of experience ex. 1,
        "education": highest qualification,
        "skills": ["List of technical skills"],
    }}
    ```

    Resume text:  
    {text}

    Important:
    - Return ONLY the JSON object, no other text  
    - All fields must be present  
    - Arrays must not be empty — if no data is found, use a single empty string in the array (`[""]`)  
    - All values must be strings  
    - Split the name into `first_name` and `last_name` based on the most likely parsing (first word = first name, last word = last name)  
    - If any value is missing, unclear, or not found, return an empty string for that field (e.g., `"linkedin_url": ""`)  
    - Do not remove fields or return null values — always return the full structure with valid string content
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
