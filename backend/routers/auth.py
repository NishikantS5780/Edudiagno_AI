from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from schemas.users import UserCreate, UserResponse, Token, UserLogin
from models.models import User
from utils.auth import verify_password, get_password_hash, create_access_token, get_current_user, create_refresh_token, authenticate_user
from config import settings

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        company_name=user.company_name,
        company_logo=user.company_logo,
        phone=user.phone,
        website=user.website,
        industry=user.industry,
        company_size=user.company_size
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": db_user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": db_user.id,
        "email": db_user.email,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "company_name": db_user.company_name,
        "company_logo": db_user.company_logo,
        "phone": db_user.phone,
        "website": db_user.website,
        "industry": db_user.industry,
        "company_size": db_user.company_size
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"user_id": user.id})
    refresh_token = create_refresh_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company_name": user.company_name,
        "company_logo": user.company_logo,
        "phone": user.phone,
        "website": user.website,
        "industry": user.industry,
        "company_size": user.company_size
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # In a more secure implementation, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}
