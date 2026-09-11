from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator  # type: ignore[import-not-found]
from app.schemas.user import UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    role: str = Field(default="user", pattern="^(user|analyst|admin)$")

    @field_validator("email")
    @classmethod
    def validate_gmail_address(cls, value: EmailStr) -> EmailStr:
        if not str(value).lower().endswith("@gmail.com"):
            raise ValueError("Registration requires a Gmail address ending with @gmail.com")
        return value

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
