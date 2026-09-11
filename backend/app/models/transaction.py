from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True, default=lambda: f"TXN-{uuid.uuid4().hex[:10].upper()}")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Financial and behavioral features
    amount = Column(Float, nullable=False)
    transaction_time_hour = Column(Integer, nullable=False, default=12)
    transaction_frequency_24h = Column(Integer, nullable=False, default=1)
    merchant_category = Column(String(50), nullable=False, default="retail")
    merchant_name = Column(String(100), nullable=True)
    location_risk_score = Column(Float, nullable=False, default=0.1)
    device_risk_score = Column(Float, nullable=False, default=0.1)
    distance_from_prev_km = Column(Float, nullable=False, default=5.0)
    prev_amount_ratio = Column(Float, nullable=False, default=1.0)
    account_age_days = Column(Integer, nullable=False, default=365)
    failed_transactions_24h = Column(Integer, nullable=False, default=0)
    is_international = Column(Integer, nullable=False, default=0)
    is_online = Column(Integer, nullable=False, default=1)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    prediction = relationship("Prediction", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
