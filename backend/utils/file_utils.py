import os
import logging
from typing import Optional
from fastapi import UploadFile
import shutil
from datetime import datetime
import string
import random

logger = logging.getLogger(__name__)

# Directory constants
LOGO_DIR = "uploads/logos"
RESUME_DIR = "uploads/resumes"

# Ensure directories exist
os.makedirs(LOGO_DIR, exist_ok=True)
os.makedirs(RESUME_DIR, exist_ok=True)

def generate_unique_filename(prefix: str, extension: str) -> str:
    """Generate a unique filename with timestamp and random string"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{prefix}_{timestamp}_{random_str}.{extension}"

async def save_upload_file(upload_file: UploadFile, directory: str) -> str:
    """Save an uploaded file to the specified directory"""
    try:
        # Generate unique filename
        file_extension = upload_file.filename.split(".")[-1]
        filename = generate_unique_filename("file", file_extension)
        file_path = os.path.join(directory, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        # Return the relative path
        return f"/{os.path.relpath(file_path, 'uploads')}"
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise 