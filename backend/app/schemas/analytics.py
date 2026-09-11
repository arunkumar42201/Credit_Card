from typing import List, Dict, Any
from pydantic import BaseModel, ConfigDict

class OverviewStats(BaseModel):
    total_transactions: int
    legitimate_count: int
    suspicious_count: int
    fraudulent_count: int
    fraud_rate: float
    average_risk_score: float
    total_volume_usd: float

class TrendPoint(BaseModel):
    date: str
    total: int
    legitimate: int
    suspicious: int
    fraudulent: int
    fraud_rate: float

class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int

class CategoryRiskItem(BaseModel):
    category: str
    total: int
    fraud_count: int
    fraud_rate: float

class DeviceRiskItem(BaseModel):
    device_type: str
    total: int
    fraud_count: int
    fraud_rate: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class ModelMetricsOut(BaseModel):
    model_name: str
    algorithm: str
    trained_at: str
    dataset_size: int
    test_samples: int = 3000
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    confusion_matrix: Dict[str, int]
    top_features: List[FeatureImportanceItem]
