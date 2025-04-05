import io
import os
import openai
from typing import List, Dict, Any, Optional
from config import settings
from PyPDF2 import PdfReader
from fastapi import HTTPException, status
import json
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize OpenAI client
try:
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    logger.info("OpenAI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    raise

async def generate_job_description(title: str, department: str, location: str) -> str:
    """Generate a job description using OpenAI"""
    prompt = f"""
    Create a comprehensive job description for a {title} position in the {department} department.
    The position is {location}-based.
    
    Include the following sections:
    1. Overview of the role and responsibilities
    2. Requirements and qualifications
    3. Benefits and perks
    
    Format the content with markdown, using ## for section headers.
    """

    try:
        print(f"Making OpenAI API call with model: gpt-4")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant specializing in creating compelling job descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating job description: {e}")
        return f"Failed to generate job description. Please try again. Error: {str(e)}"

async def extract_resume_details(resume_path: str) -> str:
    """Extract structured information from a resume using AI"""
    try:
        # Read the PDF file
        reader = PdfReader(resume_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        if not text:
            raise ValueError("No text could be extracted from the PDF")
        
        # Prepare the prompt for OpenAI
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
        
        # Call OpenAI API using the new client format
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts structured information from resumes. You must return a valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Extract the response content
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error extracting resume details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract resume details: {str(e)}"
        )

async def analyze_resume_match(
    resume_text: str,
    job_description: str,
    job_requirements: str
) -> str:
    """Analyze how well a resume matches a job description"""
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""Analyze how well this resume matches the job description and requirements.
        Return ONLY a JSON object with these exact fields:
        {{
            "match_score": number between 0 and 100,
            "strengths": ["List of strengths"],
            "improvements": ["List of areas for improvement"],
            "feedback": "Detailed feedback about the match"
        }}

        Resume Text:
        {resume_text}

        Job Description:
        {job_description}

        Job Requirements:
        {job_requirements}

        Important:
        - Return ONLY the JSON object, no other text
        - All fields must be present
        - match_score must be a number between 0 and 100
        - Arrays should not be empty (use empty string if no data)
        - All other values must be strings
        """
        
        # Call OpenAI API using the new client format
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes resume-job matches. You must return a valid JSON object."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Extract the response content
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error analyzing resume match: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume match: {str(e)}"
        )

def generate_interview_questions(
    job_title: str,
    job_description: str,
    resume_text: str,
    question_types: List[str],
    max_questions: int,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> List[Dict[str, str]]:
    """Generate interview questions using OpenAI"""
    try:
        # If no resume text or job description is provided, generate a basic question
        if not resume_text and not job_description:
            return [{
                "question": "Could you please tell me about your experience as a Senior Software Engineer?",
                "type": "general"
            }]

        # Check if this is the first question
        is_first_question = not conversation_history or len(conversation_history) == 0

        system_prompt = f"""You are an expert technical interviewer for the position of {job_title}.
Your task is to generate interview questions based on the job description and candidate's resume.

The questions should be:
1. Clear and concise
2. Relevant to the position
3. Based on the candidate's experience from their resume
4. Progressive in difficulty
5. Natural and conversational

Current question types: {', '.join(question_types)}
Maximum questions to generate: {max_questions}

Job Description:
{job_description}

Candidate's Resume:
{resume_text}

Previous conversation:
{format_conversation_history(conversation_history or [])}

{'For the first question, start with a brief greeting and then ask your first question. Format it as: "Hello! [Greeting message]. [Question]".' if is_first_question else 'Generate ONLY the next question that would be most appropriate to ask at this point in the interview.'}

The question should be based on the previous conversation and maintain a natural flow.
If no resume text or job description is provided, generate a basic question about the candidate's experience.

Return the questions as a JSON array of objects with "question" and "type" fields."""

        logger.info(f"Making OpenAI API call with model: gpt-4")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate the interview questions."}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response
        try:
            questions = json.loads(response.choices[0].message.content)
            if not isinstance(questions, list):
                questions = [{"question": response.choices[0].message.content, "type": "general"}]
            return questions
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response: {e}")
            return [{"question": response.choices[0].message.content, "type": "general"}]
            
    except Exception as e:
        logger.error(f"Error generating interview questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview questions: {str(e)}"
        )

def process_interview_response(
    response: str,
    job_title: str,
    job_description: str,
    resume_text: str,
    conversation_history: List[Dict[str, str]]
) -> Dict[str, str]:
    """Process the candidate's response and provide feedback"""
    system_prompt = f"""You are an expert technical interviewer for the position of {job_title}.
Your task is to analyze the candidate's response and provide constructive feedback.
The feedback should:
1. Acknowledge strong points in the response
2. Identify areas for improvement
3. Be specific and actionable
4. Maintain a professional and encouraging tone

Job Description:
{job_description}

Candidate's Resume:
{resume_text}

Previous conversation:
{format_conversation_history(conversation_history)}

Candidate's Response:
{response}

Provide feedback on the response and suggest areas for improvement."""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return {"feedback": response.choices[0].message.content.strip()}
    except Exception as e:
        print(f"Error processing response: {str(e)}")
        raise

def format_conversation_history(history: List[Dict[str, str]]) -> str:
    """Format conversation history for the prompt"""
    if not history:
        return "No previous conversation."
    
    formatted = []
    for message in history:
        role = "Interviewer" if message["role"] == "assistant" else "Candidate"
        formatted.append(f"{role}: {message['content']}")
    
    return "\n".join(formatted)

def evaluate_interview_response(question: str, response_text: str, job_title: str) -> Dict[str, Any]:
    """Evaluate a candidate's response to an interview question"""
    prompt = f"""
    Evaluate the following candidate response to an interview question for a {job_title} position.
    
    Question:
    {question}
    
    Candidate Response:
    {response_text}
    
    Provide an evaluation with:
    1. A score from 0-100
    2. Detailed feedback on strengths
    3. Areas for improvement
    
    Format your response as JSON with these exact keys:
    {{
        "score": 85,
        "strengths": "The response demonstrates...",
        "improvements": "The candidate could improve by..."
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert interviewer who evaluates candidate responses objectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        parsed_result = json.loads(result)
        
        return {
            "score": parsed_result.get("score", 50),
            "feedback": f"Strengths: {parsed_result.get('strengths', 'No strengths identified')}\n\nAreas for improvement: {parsed_result.get('improvements', 'No improvements suggested')}"
        }
    except Exception as e:
        print(f"Error evaluating response: {e}")
        return {
            "score": 50,
            "feedback": f"Failed to evaluate response. Error: {str(e)}"
        }

def transcribe_audio(audio_file_path: str) -> Dict[str, Any]:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create("whisper-1", audio_file)
        return {
             "success": True,
             "text": transcript.text,
             "language": transcript.get("language", "en")
        }
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return {
             "success": False,
             "error": str(e),
             "text": "Failed to transcribe audio."
         }

def text_to_speech(text: str):
    try:
        with client.audio.speech.with_streaming_response.create(model="gpt-4o-mini-tts", voice="coral", input=text, instructions="Speak as an interviewer") as response:

            speech_file = io.BytesIO()

            for chunk in response.iter_bytes():
                speech_file.write(chunk)

            speech_file.seek(0)

            return speech_file
    except Exception as e:
        print(f"Error converting text to audio: {e}")
        return None

def analyze_video_response(question: str, transcript: str, job_description: str) -> Dict[str, Any]:
    """Analyze a video response and provide feedback"""
    prompt = f"""
    Analyze the following video interview response for a job position.
    
    Question:
    {question}
    
    Candidate Response (Transcript):
    {transcript}
    
    Job Description:
    {job_description}
    
    Provide an evaluation with:
    1. A score from 0-100
    2. Detailed feedback on strengths and areas for improvement
    3. Key points mentioned by the candidate
    4. Any red flags or outstanding qualities
    Format your response as JSON with these exact keys:
    {{
        "score": 85,
        "feedback": "Detailed feedback here...",
        "key_points": ["Point 1", "Point 2", "Point 3"],
        "strengths": ["Strength 1", "Strength 2"],
        "areas_to_improve": ["Area 1", "Area 2"],
        "red_flags": ["Red flag 1"] or [],
        "outstanding_qualities": ["Quality 1"] or []
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert interviewer who evaluates video responses objectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        parsed_result = json.loads(result)

        key_points = {"- " + "\n- ".join(parsed_result.get('key_points', ['No key points identified']))}

        strengths = {"- " + "\n- ".join(parsed_result.get('strengths', ['No specific strengths identified']))}

        areas_to_improve = {"- " + "\n- ".join(parsed_result.get('areas_to_improve', ['No specific areas for improvement identified']))}

        red_flags = {f"Red Flags:\n- " + "\n- ".join(parsed_result.get('red_flags')) if parsed_result.get('red_flags') and len(parsed_result.get('red_flags')) > 0 else ""}

        outstanding_qualities = {f"Outstanding Qualities:\n- " + "\n- ".join(parsed_result.get('outstanding_qualities')) if parsed_result.get('outstanding_qualities') and len(parsed_result.get('outstanding_qualities')) > 0 else ""}

        # Format feedback for presentation
        formatted_feedback = f"""
         Overall Evaluation: {parsed_result.get('score', 50)}/100
         
         Key Points:
         {key_points}
         
         Strengths:
         {strengths}
         
         Areas to Improve:
         {areas_to_improve}

        {red_flags}
         
         {outstanding_qualities}
         """
        
        return {
            "score": parsed_result.get("score", 50),
            "feedback": parsed_result.get("feedback", "No feedback provided"),
             "formatted_feedback": formatted_feedback,
             "key_points": parsed_result.get("key_points", []),
             "strengths": parsed_result.get("strengths", []),
             "areas_to_improve": parsed_result.get("areas_to_improve", []),
             "red_flags": parsed_result.get("red_flags", []),
             "outstanding_qualities": parsed_result.get("outstanding_qualities", [])
        }
    except Exception as e:
        print(f"Error analyzing video response: {e}")
        return {
            "score": 50,
            "feedback": f"Failed to analyze response. Error: {str(e)}",
             "formatted_feedback": f"Failed to analyze response. Error: {str(e)}",
             "key_points": [],
             "strengths": [],
             "areas_to_improve": [],
             "red_flags": [],
             "outstanding_qualities": []
        }

def generate_followup_question(
     question: str, 
     response: str, 
     job_title: str,
     is_last_question: bool = False
 ) -> str:
     """Generate a follow-up question or closing statement based on candidate response"""
     prompt = f"""
     Based on the candidate's response to an interview question for a {job_title} position, 
     generate an appropriate follow-up comment or question.
     
     Original Question:
     {question}
     
     Candidate Response:
     {response}
     
     This is {'the last question' if is_last_question else 'not the last question'} in the interview.
     
     {'Generate a closing statement thanking the candidate and explaining next steps.' if is_last_question else 'Generate a brief follow-up question or comment that follows naturally from their response.'}
     
     Keep your response conversational, brief (1-3 sentences maximum), and professional.
     """
 
     try:
         response = client.chat.completions.create(
             model="gpt-4",
             messages=[
                 {"role": "system", "content": "You are an expert interviewer who asks insightful follow-up questions."},
                 {"role": "user", "content": prompt}
             ],
             temperature=0.7,
             max_tokens=150
         )
         
         return response.choices[0].message.content
     except Exception as e:
        print(f"Error generating follow-up question: {e}")
        if is_last_question:
            return "Thank you for completing the interview. We'll review your responses and get back to you soon with next steps."
        else:
            return "Thank you for sharing that. Let's move on to the next question."
         

async def generate_job_requirements(title: str, department: str, location: str, keywords: str = "") -> str:
    """Generate job requirements using OpenAI"""
    prompt = f"""
    Create a comprehensive list of requirements for a {title} position in the {department} department.
    The position is {location}-based.
    
    {f"Additional keywords to consider: {keywords}" if keywords else ""}
    
    Include:
    1. Required qualifications and education
    2. Required experience and skills
    3. Technical requirements
    4. Soft skills and personal attributes
    
    Format the content with bullet points.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant specializing in creating detailed job requirements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating job requirements: {e}")
        return f"Failed to generate job requirements. Please try again. Error: {str(e)}"

async def generate_job_benefits(title: str, department: str, location: str, keywords: str = "") -> str:
    """Generate job benefits using OpenAI"""
    prompt = f"""
    Create an attractive benefits package description for a {title} position in the {department} department.
    The position is {location}-based.
    
    {f"Additional keywords to consider: {keywords}" if keywords else ""}
    
    Include:
    1. Compensation and financial benefits
    2. Health and wellness benefits
    3. Work-life balance benefits
    4. Professional development opportunities
    5. Company culture and perks
    
    Format the content with bullet points.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant specializing in creating compelling benefits packages."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating job benefits: {e}")
        return f"Failed to generate job benefits. Please try again. Error: {str(e)}"
