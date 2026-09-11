import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionInput
from app.schemas.prediction import PredictResponse, BatchPredictResponse
from app.services.fraud_service import FraudService
from app.utils.security import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict", response_model=PredictResponse)
def predict_transaction(
    req: TransactionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run real-time ML fraud prediction and risk scoring for an individual transaction."""
    return FraudService.process_single_prediction(db, req, current_user)

@router.post("/batch", response_model=BatchPredictResponse)
async def predict_batch_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload CSV dataset and run batch fraud detection inference."""
    return await FraudService.process_batch_csv(db, file, current_user)

@router.get("/history", response_model=List[PredictResponse])
def get_prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent prediction history for the current user (or all if analyst/admin)."""
    query = db.query(Prediction).join(Transaction, Prediction.transaction_id == Transaction.id)
    if current_user.role == "user":
        query = query.filter(Transaction.user_id == current_user.id)
    
    preds = query.order_by(Prediction.created_at.desc()).limit(limit).all()
    
    results = []
    for p in preds:
        factors = []
        if p.risk_factors:
            try:
                factors = json.loads(p.risk_factors)
            except Exception:
                factors = [p.risk_factors]

        results.append(PredictResponse(
            transaction_id=p.transaction_id,
            prediction=p.prediction,
            probability=p.probability,
            risk_score=p.risk_score,
            risk_level=p.risk_level,
            risk_factors=factors,
            recommendation=p.recommendation,
            status=p.status,
            created_at=p.created_at
        ))
    return results

@router.get("/{prediction_id}", response_model=PredictResponse)
def get_prediction_by_id(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch specific prediction details."""
    p = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not p:
        p = db.query(Prediction).filter(Prediction.transaction_id == prediction_id).first()
    
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found")

    factors = []
    if p.risk_factors:
        try:
            factors = json.loads(p.risk_factors)
        except Exception:
            factors = [p.risk_factors]

    return PredictResponse(
        transaction_id=p.transaction_id,
        prediction=p.prediction,
        probability=p.probability,
        risk_score=p.risk_score,
        risk_level=p.risk_level,
        risk_factors=factors,
        recommendation=p.recommendation,
        status=p.status,
        created_at=p.created_at
    )
