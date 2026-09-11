import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy import func, desc, case
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.analytics import OverviewStats, TrendPoint, RiskDistribution, CategoryRiskItem, DeviceRiskItem

class AnalyticsService:
    @staticmethod
    def get_overview_stats(db: Session, user: User = None) -> OverviewStats:
        query = db.query(Prediction).join(Transaction, Prediction.transaction_id == Transaction.id)
        if user and user.role == "user":
            query = query.filter(Transaction.user_id == user.id)

        total_txns = query.count()
        legit = query.filter(Prediction.prediction == "Legitimate").count()
        susp = query.filter(Prediction.prediction == "Suspicious").count()
        fraud = query.filter(Prediction.prediction == "Fraudulent").count()

        avg_score = db.query(func.avg(Prediction.risk_score))
        if user and user.role == "user":
            avg_score = avg_score.join(Transaction, Prediction.transaction_id == Transaction.id).filter(Transaction.user_id == user.id)
        avg_score_val = avg_score.scalar() or 0.0

        volume_query = db.query(func.sum(Transaction.amount))
        if user and user.role == "user":
            volume_query = volume_query.filter(Transaction.user_id == user.id)
        total_vol = volume_query.scalar() or 0.0

        fraud_rate = round((fraud / total_txns) * 100, 2) if total_txns > 0 else 0.0

        return OverviewStats(
            total_transactions=total_txns,
            legitimate_count=legit,
            suspicious_count=susp,
            fraudulent_count=fraud,
            fraud_rate=fraud_rate,
            average_risk_score=round(float(avg_score_val), 1),
            total_volume_usd=round(float(total_vol), 2)
        )

    @staticmethod
    def get_trends(db: Session, days: int = 14, user: User = None) -> List[TrendPoint]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        query = db.query(
            func.date(Transaction.created_at).label("day"),
            Prediction.prediction,
            func.count(Prediction.id).label("count")
        ).join(Prediction, Transaction.id == Prediction.transaction_id).filter(
            Transaction.created_at >= cutoff
        )

        if user and user.role == "user":
            query = query.filter(Transaction.user_id == user.id)

        rows = query.group_by(func.date(Transaction.created_at), Prediction.prediction).all()

        daily_map: Dict[str, Dict[str, int]] = {}
        for i in range(days + 1):
            d_str = (datetime.now(timezone.utc) - timedelta(days=days - i)).strftime("%Y-%m-%d")
            daily_map[d_str] = {"Legitimate": 0, "Suspicious": 0, "Fraudulent": 0}

        for day, pred, count in rows:
            if day in daily_map:
                daily_map[day][pred] = count

        trends = []
        for d_str, counts in sorted(daily_map.items()):
            tot = counts["Legitimate"] + counts["Suspicious"] + counts["Fraudulent"]
            fr = round((counts["Fraudulent"] / tot) * 100, 1) if tot > 0 else 0.0
            trends.append(TrendPoint(
                date=d_str,
                total=tot,
                legitimate=counts["Legitimate"],
                suspicious=counts["Suspicious"],
                fraudulent=counts["Fraudulent"],
                fraud_rate=fr
            ))
        return trends

    @staticmethod
    def get_risk_distribution(db: Session, user: User = None) -> RiskDistribution:
        query = db.query(Prediction.risk_level, func.count(Prediction.id))
        if user and user.role == "user":
            query = query.join(Transaction, Prediction.transaction_id == Transaction.id).filter(Transaction.user_id == user.id)
        
        rows = query.group_by(Prediction.risk_level).all()
        counts = {r[0]: r[1] for r in rows}

        return RiskDistribution(
            low=counts.get("LOW", 0),
            medium=counts.get("MEDIUM", 0),
            high=counts.get("HIGH", 0),
            critical=counts.get("CRITICAL", 0)
        )

    @staticmethod
    def get_categories(db: Session, user: User = None) -> List[CategoryRiskItem]:
        query = db.query(
            Transaction.merchant_category,
            func.count(Transaction.id).label("total"),
            func.sum(
                case(
                    (Prediction.prediction == "Fraudulent", 1),
                    else_=0
                )
            ).label("fraud")
        ).join(Prediction, Transaction.id == Prediction.transaction_id)

        if user and user.role == "user":
            query = query.filter(Transaction.user_id == user.id)

        rows = query.group_by(Transaction.merchant_category).all()
        result = []
        for cat, total, fraud in rows:
            fraud_c = int(fraud or 0)
            result.append(CategoryRiskItem(
                category=cat or "other",
                total=total,
                fraud_count=fraud_c,
                fraud_rate=round((fraud_c / total) * 100, 1) if total > 0 else 0.0
            ))
        return sorted(result, key=lambda x: x.fraud_rate, reverse=True)
