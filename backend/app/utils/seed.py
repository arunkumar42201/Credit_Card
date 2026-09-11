import os
import json
import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.transaction import Transaction
from app.models.prediction import Prediction
from app.utils.security import hash_password
from app.ml.predict import predictor

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    admin_email = "admin@fraudguard.io"
    analyst_email = "analyst@fraudguard.io"
    user_email = "user@fraudguard.io"

    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin = User(
            name="System Administrator",
            email=admin_email,
            password_hash=hash_password("Admin@123456"),
            role="admin",
            is_active=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=90)
        )
        db.add(admin)

    analyst = db.query(User).filter(User.email == analyst_email).first()
    if not analyst:
        analyst = User(
            name="Senior Risk Analyst",
            email=analyst_email,
            password_hash=hash_password("Analyst@123456"),
            role="analyst",
            is_active=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=60)
        )
        db.add(analyst)

    demo_user = db.query(User).filter(User.email == user_email).first()
    if not demo_user:
        demo_user = User(
            name="Jane Doe",
            email=user_email,
            password_hash=hash_password("User@123456"),
            role="user",
            is_active=True,
            created_at=datetime.now(timezone.utc) - timedelta(days=30)
        )
        db.add(demo_user)

    db.commit()
    db.refresh(admin)
    db.refresh(analyst)
    db.refresh(demo_user)

    txn_count = db.query(Transaction).count()
    if txn_count < 20:
        print(f"Seeding historical transactions (current count: {txn_count})...")
        categories = ["grocery", "electronics", "travel", "dining", "clothing", "entertainment", "gas_transport", "health_beauty", "utilities", "retail"]

        random.seed(42)
        for i in range(75):
            days_ago = random.randint(0, 14)
            txn_hour = random.randint(0, 23)
            created_dt = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 12))
            is_fraud_scenario = (random.random() < 0.16)

            if is_fraud_scenario:
                amount = round(random.uniform(450.0, 3950.0), 2)
                loc_risk = round(random.uniform(0.65, 0.95), 2)
                dev_risk = round(random.uniform(0.60, 0.92), 2)
                distance = round(random.uniform(400.0, 3200.0), 1)
                prev_ratio = round(random.uniform(3.5, 12.0), 2)
                failed_count = random.choice([1, 2, 3, 4])
                cat = random.choice(["electronics", "travel", "clothing", "retail"])
                intl = 1 if random.random() < 0.6 else 0
                freq = random.randint(5, 16)
            else:
                amount = round(random.uniform(8.5, 185.0), 2)
                loc_risk = round(random.uniform(0.02, 0.35), 2)
                dev_risk = round(random.uniform(0.01, 0.30), 2)
                distance = round(random.uniform(0.5, 25.0), 1)
                prev_ratio = round(random.uniform(0.6, 1.4), 2)
                failed_count = 0 if random.random() < 0.9 else 1
                cat = random.choice(categories)
                intl = 0 if random.random() < 0.9 else 1
                freq = random.randint(1, 4)

            input_features = {
                "amount": amount,
                "transaction_time_hour": txn_hour,
                "transaction_frequency_24h": freq,
                "merchant_category": cat,
                "location_risk_score": loc_risk,
                "device_risk_score": dev_risk,
                "distance_from_prev_km": distance,
                "prev_amount_ratio": prev_ratio,
                "account_age_days": random.randint(90, 1200),
                "failed_transactions_24h": failed_count,
                "is_international": intl,
                "is_online": 1 if random.random() < 0.7 else 0
            }

            res = predictor.predict_single(input_features)

            txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
            pred_id = f"PRED-{uuid.uuid4().hex[:10].upper()}"
            
            owner_user = random.choice([demo_user, analyst, admin])

            t = Transaction(
                id=txn_id,
                user_id=owner_user.id,
                amount=amount,
                transaction_time_hour=txn_hour,
                transaction_frequency_24h=freq,
                merchant_category=cat,
                location_risk_score=loc_risk,
                device_risk_score=dev_risk,
                distance_from_prev_km=distance,
                prev_amount_ratio=prev_ratio,
                account_age_days=input_features["account_age_days"],
                failed_transactions_24h=failed_count,
                is_international=intl,
                is_online=input_features["is_online"],
                notes=f"{cat.title()} transaction via web gateway",
                created_at=created_dt
            )
            p = Prediction(
                id=pred_id,
                transaction_id=txn_id,
                prediction=res["prediction"],
                probability=res["probability"],
                risk_score=res["risk_score"],
                risk_level=res["risk_level"],
                risk_factors=json.dumps(res["risk_factors"]),
                recommendation=res["recommendation"],
                status="analyzed",
                created_at=created_dt
            )
            db.add(t)
            db.add(p)

        db.commit()
        print("Database seeded with sample transactions successfully.")

    db.close()

if __name__ == "__main__":
    seed_database()
