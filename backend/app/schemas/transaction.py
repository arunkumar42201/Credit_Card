from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class TransactionInput(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in USD")
    transaction_time_hour: int = Field(default=12, ge=0, le=23, description="Hour of day (0-23)")
    transaction_frequency_24h: int = Field(default=1, ge=1, le=100, description="Transactions within last 24h")
    merchant_category: str = Field(default="retail", description="Merchant category")
    merchant_name: Optional[str] = Field(default=None, description="Optional merchant business name")
    location_risk_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Location/IP risk index (0.0 - 1.0)")
    device_risk_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Device fingerprint risk (0.0 - 1.0)")
    distance_from_prev_km: float = Field(default=2.5, ge=0.0, description="Distance from prior transaction in km")
    prev_amount_ratio: float = Field(default=1.0, ge=0.0, description="Ratio to customer 30-day average amount")
    account_age_days: int = Field(default=365, ge=0, description="Account age in days")
    failed_transactions_24h: int = Field(default=0, ge=0, description="Failed attempts in prior 24h")
    is_international: int = Field(default=0, ge=0, le=1, description="1 if international, 0 if domestic")
    is_online: int = Field(default=1, ge=0, le=1, description="1 if online, 0 if physical in-store")
    notes: Optional[str] = Field(default=None, description="Optional notes or reference")

class TransactionOut(TransactionInput):
    id: str
    user_id: Optional[int] = None
    created_at: datetime
    prediction: Optional["PredictionSummary"] = None

    model_config = ConfigDict(from_attributes=True)

class PredictionSummary(BaseModel):
    prediction: str
    probability: float
    risk_score: int
    risk_level: str
    status: str

    model_config = ConfigDict(from_attributes=True)

TransactionOut.model_rebuild()
