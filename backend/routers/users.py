
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
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.company_name is not None:
        current_user.company_name = user_update.company_name
    if user_update.company_logo is not None:
        current_user.company_logo = user_update.company_logo
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.website is not None:
        current_user.website = user_update.website
    if user_update.industry is not None:
        current_user.industry = user_update.industry
    if user_update.company_size is not None:
        current_user.company_size = user_update.company_size
    
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
