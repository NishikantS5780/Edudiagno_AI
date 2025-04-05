from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas.users import UserResponse, UserUpdate
from models.models import User
from utils.auth import get_current_user
from utils.file_utils import save_upload_file, LOGO_DIR

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    # Update user fields
    for field, value in user_update.dict(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/upload-logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a company logo"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Save the file locally
        logo_url = await save_upload_file(file, LOGO_DIR)
        
        # Update user with logo URL
        current_user.company_logo = logo_url
        db.commit()
        
        return {"logo_url": logo_url, "file_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload logo: {str(e)}")
