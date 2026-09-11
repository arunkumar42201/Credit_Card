from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.auth_service import AuthService
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user or analyst and return JWT access token."""
    return AuthService.register_user(db, req)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT token."""
    return AuthService.authenticate_user(db, req)

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user details."""
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint. Client discards JWT token."""
    return {"message": "Successfully logged out", "user_id": current_user.id}
