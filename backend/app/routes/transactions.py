from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.prediction import Prediction
from app.schemas.transaction import TransactionOut, PredictionSummary
from app.utils.security import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionOut])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    risk_level: Optional[str] = None,
    prediction: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List transactions with optional filtering and pagination."""
    query = db.query(Transaction).outerjoin(Prediction, Transaction.id == Prediction.transaction_id)
    
    if current_user.role == "user":
        query = query.filter(Transaction.user_id == current_user.id)
        
    if risk_level:
        query = query.filter(Prediction.risk_level == risk_level.upper())
    if prediction:
        query = query.filter(Prediction.prediction.ilike(f"%{prediction}%"))
    if search:
        query = query.filter(
            (Transaction.id.ilike(f"%{search}%")) |
            (Transaction.merchant_category.ilike(f"%{search}%")) |
            (Transaction.notes.ilike(f"%{search}%"))
        )
        
    txns = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for t in txns:
        pred_summary = None
        if t.prediction:
            pred_summary = PredictionSummary(
                prediction=t.prediction.prediction,
                probability=t.prediction.probability,
                risk_score=t.prediction.risk_score,
                risk_level=t.prediction.risk_level,
                status=t.prediction.status
            )
        
        results.append(TransactionOut(
            id=t.id,
            user_id=t.user_id,
            amount=t.amount,
            transaction_time_hour=t.transaction_time_hour,
            transaction_frequency_24h=t.transaction_frequency_24h,
            merchant_category=t.merchant_category,
            merchant_name=t.merchant_name,
            location_risk_score=t.location_risk_score,
            device_risk_score=t.device_risk_score,
            distance_from_prev_km=t.distance_from_prev_km,
            prev_amount_ratio=t.prev_amount_ratio,
            account_age_days=t.account_age_days,
            failed_transactions_24h=t.failed_transactions_24h,
            is_international=t.is_international,
            is_online=t.is_online,
            notes=t.notes,
            created_at=t.created_at,
            prediction=pred_summary
        ))
    return results

@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single transaction by ID."""
    t = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
    if current_user.role == "user" and t.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    pred_summary = None
    if t.prediction:
        pred_summary = PredictionSummary(
            prediction=t.prediction.prediction,
            probability=t.prediction.probability,
            risk_score=t.prediction.risk_score,
            risk_level=t.prediction.risk_level,
            status=t.prediction.status
        )

    return TransactionOut(
        id=t.id,
        user_id=t.user_id,
        amount=t.amount,
        transaction_time_hour=t.transaction_time_hour,
        transaction_frequency_24h=t.transaction_frequency_24h,
        merchant_category=t.merchant_category,
        merchant_name=t.merchant_name,
        location_risk_score=t.location_risk_score,
        device_risk_score=t.device_risk_score,
        distance_from_prev_km=t.distance_from_prev_km,
        prev_amount_ratio=t.prev_amount_ratio,
        account_age_days=t.account_age_days,
        failed_transactions_24h=t.failed_transactions_24h,
        is_international=t.is_international,
        is_online=t.is_online,
        notes=t.notes,
        created_at=t.created_at,
        prediction=pred_summary
    )

@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a transaction."""
    t = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if current_user.role == "user" and t.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(t)
    db.commit()
    return {"message": "Transaction deleted successfully", "transaction_id": transaction_id}
