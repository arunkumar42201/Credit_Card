from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserOut
from app.utils.security import hash_password, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, req: RegisterRequest) -> TokenResponse:
        existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists"
            )

        if req.confirm_password and req.password != req.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password and password confirmation do not match"
            )

        role = req.role if req.role in ["user", "analyst"] else "user"

        new_user = User(
            name=req.name.strip(),
            email=req.email.lower().strip(),
            password_hash=hash_password(req.password),
            role=role,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({
            "sub": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role,
            "name": new_user.name
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserOut.model_validate(new_user)
        )

    @staticmethod
    def authenticate_user(db: Session, req: LoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled by an administrator"
            )

        token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.name
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )
