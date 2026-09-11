from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.transaction import TransactionInput

class PredictRequest(TransactionInput):
    pass

class PredictResponse(BaseModel):
    transaction_id: str
    prediction: str  # "Legitimate", "Suspicious", "Fraudulent"
    probability: float
    risk_score: int
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_factors: List[str]
    recommendation: str
    status: str
    created_at: datetime
    input_data: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class BatchPredictionItem(BaseModel):
    row_index: int
    transaction_id: str
    amount: float
    merchant_category: str
    prediction: str
    probability: float
    risk_score: int
    risk_level: str
    risk_factors: List[str]
    recommendation: str

class BatchPredictResponse(BaseModel):
    total_processed: int
    legitimate_count: int
    suspicious_count: int
    fraudulent_count: int
    fraud_percentage: float
    average_risk_score: float
    results: List[BatchPredictionItem]
