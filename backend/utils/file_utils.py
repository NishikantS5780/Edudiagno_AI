
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
import shutil

# Create upload directories if they don't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

VIDEO_DIR = UPLOAD_DIR / "videos"
VIDEO_DIR.mkdir(exist_ok=True)

RESUME_DIR = UPLOAD_DIR / "resumes"
RESUME_DIR.mkdir(exist_ok=True)

LOGO_DIR = UPLOAD_DIR / "logos"
LOGO_DIR.mkdir(exist_ok=True)

def generate_unique_filename(directory: str, extension: str) -> str:
    """Generate a unique filename for uploaded files"""
    unique_id = str(uuid.uuid4())
    return f"{directory}/{unique_id}.{extension}"

async def save_upload_file(upload_file: UploadFile, directory: Path) -> str:
    """Save an uploaded file to the specified directory and return the file path"""
    # Ensure the directory exists
    directory.mkdir(exist_ok=True)
    
    # Generate a unique filename
    file_extension = upload_file.filename.split(".")[-1] if "." in upload_file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = directory / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the relative path from the uploads directory
    relative_path = str(file_path.relative_to(UPLOAD_DIR))
    return f"/uploads/{relative_path}"
