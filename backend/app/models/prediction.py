from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(64), primary_key=True, index=True, default=lambda: f"PRED-{uuid.uuid4().hex[:10].upper()}")
    transaction_id = Column(String(64), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Prediction details
    prediction = Column(String(30), nullable=False)  # "Legitimate", "Suspicious", "Fraudulent"
    probability = Column(Float, nullable=False)       # 0.0 to 1.0 (fraud probability)
    risk_score = Column(Integer, nullable=False)      # 0 to 100
    risk_level = Column(String(20), nullable=False)   # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_factors = Column(Text, nullable=True)        # JSON string of major risk indicators
    recommendation = Column(Text, nullable=False)
    
    status = Column(String(30), default="analyzed", nullable=False)  # "analyzed", "approved", "flagged", "blocked"
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    transaction = relationship("Transaction", back_populates="prediction")
