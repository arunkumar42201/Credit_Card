from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserStatusUpdate, UserRoleUpdate
from app.schemas.analytics import OverviewStats, ModelMetricsOut
from app.services.analytics_service import AnalyticsService
from app.ml.predict import predictor
from app.utils.security import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Admin: View and search registered users."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    return query.order_by(User.created_at.desc()).all()

@router.patch("/users/{user_id}/status", response_model=UserOut)
def toggle_user_status(user_id: int, req: UserStatusUpdate, db: Session = Depends(get_db)):
    """Admin: Enable or disable user account access."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = req.is_active
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/{user_id}/role", response_model=UserOut)
def change_user_role(user_id: int, req: UserRoleUpdate, db: Session = Depends(get_db)):
    """Admin: Modify user role (user, analyst, admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if req.role not in ["user", "analyst", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    user.role = req.role
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Admin: Delete user."""
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own admin account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully", "user_id": user_id}

@router.get("/statistics", response_model=OverviewStats)
def get_admin_system_statistics(db: Session = Depends(get_db)):
    """Admin: System-wide fraud statistics across all users."""
    return AnalyticsService.get_overview_stats(db, user=None)

@router.get("/model-info", response_model=ModelMetricsOut)
def get_model_info():
    """Admin: Real machine learning model evaluation metrics and feature importances."""
    metrics = predictor.metrics
    return ModelMetricsOut(**metrics)
