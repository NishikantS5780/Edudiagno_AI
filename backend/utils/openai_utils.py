import os
import openai
from typing import List, Dict, Any, Optional
from config import settings

# Set up OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

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
        response = await openai.ChatCompletion.acreate(
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

async def analyze_resume_match(resume_text: str, job_description: str, job_requirements: str) -> Dict[str, Any]:
    """Analyze how well a resume matches a job description"""
    prompt = f"""
    Analyze how well the following resume matches the job description and requirements.
    Provide a match percentage (0-100) and detailed feedback on strengths and areas of improvement.
    
    Job Description:
    {job_description}
    
    Job Requirements:
    {job_requirements}
    
    Resume:
    {resume_text}
    
    Format your response as JSON with these exact keys:
    {{
        "match_percentage": 85,
        "feedback": "Detailed feedback here..."
    }}
    """

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert HR assistant that evaluates how well a candidate's resume matches a job description."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        # Parse the JSON response - in a real app, add better error handling
        import json
        parsed_result = json.loads(result)
        
        return {
            "match": float(parsed_result.get("match_percentage", 0)) / 100,  # Convert to 0-1 scale
            "feedback": parsed_result.get("feedback", "No feedback provided")
        }
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        return {
            "match": 0.5,  # Default match score
            "feedback": f"Failed to analyze resume. Error: {str(e)}"
        }

async def generate_interview_questions(
    job_title: str, 
    job_description: str, 
    resume_text: str = "", 
    question_types: List[str] = ["technical", "behavioral", "problemSolving"],
    count: int = 5
) -> List[Dict[str, str]]:
    """Generate interview questions based on job and resume"""
    
    type_descriptions = {
        "technical": "questions about technical skills and knowledge relevant to the job",
        "behavioral": "questions about past experiences and how the candidate handled specific situations",
        "problemSolving": "questions that test the candidate's problem-solving abilities",
        "general": "general questions about the candidate's background and career goals"
    }
    
    # Build type instruction
    type_instruction = ""
    for q_type in question_types:
        if q_type in type_descriptions:
            type_instruction += f"- {q_type.capitalize()}: {type_descriptions[q_type]}\n"
    
    prompt = f"""
    Generate {count} interview questions for a {job_title} position.
    
    Job Description:
    {job_description}
    
    {"Candidate Resume:" + resume_text if resume_text else "No resume provided."}
    
    Include these question types:
    {type_instruction}
    
    Format the output as a JSON array with objects containing:
    1. "question": The full question text
    2. "type": One of these exact values: "technical", "behavioral", "problemSolving", or "general"
    
    Example:
    [
        {{
            "question": "Describe a challenging project you worked on and how you handled obstacles.",
            "type": "behavioral"
        }},
        {{
            "question": "How would you implement a binary search algorithm?",
            "type": "technical"
        }}
    ]
    """

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert interviewer who creates targeted interview questions based on job requirements and candidate experience."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        # Parse the JSON response
        import json
        parsed_result = json.loads(result)
        
        # Ensure we have a list of questions
        if isinstance(parsed_result, list):
            return parsed_result
        elif isinstance(parsed_result, dict) and "questions" in parsed_result:
            return parsed_result["questions"]
        else:
            # Fallback questions if format is unexpected
            return [
                {"question": f"Tell us about your experience with {job_title} roles.", "type": "general"},
                {"question": "Describe a challenging project you worked on.", "type": "behavioral"},
                {"question": "What are your strengths and weaknesses?", "type": "general"}
            ]
            
    except Exception as e:
        print(f"Error generating interview questions: {e}")
        # Fallback questions if API fails
        return [
            {"question": f"Tell us about your experience with {job_title} roles.", "type": "general"},
            {"question": "Describe a challenging project you worked on.", "type": "behavioral"},
            {"question": "What are your strengths and weaknesses?", "type": "general"}
        ]

async def evaluate_interview_response(question: str, response_text: str, job_title: str) -> Dict[str, Any]:
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
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert interviewer who evaluates candidate responses objectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        import json
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

async def transcribe_audio(audio_file_path: str) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = await openai.Audio.atranscribe("whisper-1", audio_file)
        return transcript.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return "Failed to transcribe audio."

async def analyze_video_response(question: str, transcript: str, job_description: str) -> Dict[str, Any]:
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
    
    Format your response as JSON with these exact keys:
    {{
        "score": 85,
        "feedback": "Detailed feedback here..."
    }}
    """

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert interviewer who evaluates video responses objectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        import json
        parsed_result = json.loads(result)
        
        return {
            "score": parsed_result.get("score", 50),
            "feedback": parsed_result.get("feedback", "No feedback provided")
        }
    except Exception as e:
        print(f"Error analyzing video response: {e}")
        return {
            "score": 50,
            "feedback": f"Failed to analyze response. Error: {str(e)}"
        }
