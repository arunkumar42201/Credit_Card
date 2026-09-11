from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_profile(req: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.name:
        current_user.name = req.name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user
