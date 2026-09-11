from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.analytics import OverviewStats, TrendPoint, RiskDistribution, CategoryRiskItem
from app.services.analytics_service import AnalyticsService
from app.utils.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewStats)
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch high-level KPI stats (Total, Fraud, Suspicious, Avg Risk Score, Volume)."""
    return AnalyticsService.get_overview_stats(db, current_user)

@router.get("/trends", response_model=List[TrendPoint])
def get_trends(
    days: int = Query(default=14, ge=3, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Daily fraud trends and historical transaction volume."""
    return AnalyticsService.get_trends(db, days, current_user)

@router.get("/risk-distribution", response_model=RiskDistribution)
def get_risk_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Distribution of transactions across LOW, MEDIUM, HIGH, and CRITICAL risk levels."""
    return AnalyticsService.get_risk_distribution(db, current_user)

@router.get("/categories", response_model=List[CategoryRiskItem])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fraud breakdown by merchant category."""
    return AnalyticsService.get_categories(db, current_user)
