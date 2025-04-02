
"""
Local file storage utility that mimics S3 functionality but stores files locally.
This is for development purposes only and should be replaced with actual S3 in production.
"""

import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from config import settings

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def generate_unique_filename(prefix, extension):
    """Generate a unique filename with a given prefix and extension"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:8]
    
    # Create the prefix directory if it doesn't exist
    prefix_dir = UPLOAD_DIR / prefix
    prefix_dir.mkdir(exist_ok=True)
    
    return f"{prefix}/{timestamp}_{random_id}.{extension}"

def generate_presigned_url(object_name, expiration=3600):
    """
    In local development, we don't need presigned URLs.
    Instead, return a local path that the frontend can use to upload directly.
    """
    filepath = str(UPLOAD_DIR / object_name)
    return f"/api/upload/{object_name}"

def upload_file_to_s3(file_path, object_name):
    """Copy a file to the local uploads directory"""
    destination = UPLOAD_DIR / object_name
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    
    try:
        shutil.copy2(file_path, destination)
        return f"/uploads/{object_name}"
    except Exception as e:
        print(f"Error copying file: {e}")
        return None

def get_presigned_download_url(object_name, expiration=3600):
    """
    In local development, we can just return the path to the file
    """
    return f"/uploads/{object_name}"

def delete_s3_object(object_name):
    """Delete a file from the local uploads directory"""
    try:
        file_path = UPLOAD_DIR / object_name
        if file_path.exists():
            file_path.unlink()
        return True
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False

def list_s3_objects(prefix=''):
    """List files in the local uploads directory with a given prefix"""
    try:
        prefix_dir = UPLOAD_DIR / prefix
        if not prefix_dir.exists():
            return []
            
        files = []
        for file in prefix_dir.glob('**/*'):
            if file.is_file():
                relative_path = file.relative_to(UPLOAD_DIR)
                files.append({
                    'Key': str(relative_path),
                    'LastModified': datetime.fromtimestamp(file.stat().st_mtime),
                    'Size': file.stat().st_size
                })
        return files
    except Exception as e:
        print(f"Error listing files: {e}")
        return []
