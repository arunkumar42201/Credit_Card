import json
import uuid
from datetime import datetime, timezone
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile

from app.models.user import User
from app.models.transaction import Transaction
from app.models.prediction import Prediction
from app.schemas.transaction import TransactionInput
from app.schemas.prediction import PredictResponse, BatchPredictResponse, BatchPredictionItem
from app.ml.predict import predictor
from app.utils.validators import validate_and_clean_transaction_df

class FraudService:
    @staticmethod
    def process_single_prediction(
        db: Session,
        input_data: TransactionInput,
        user: Optional[User] = None
    ) -> PredictResponse:
        dict_data = input_data.model_dump()
        ml_res = predictor.predict_single(dict_data)

        txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        pred_id = f"PRED-{uuid.uuid4().hex[:10].upper()}"

        txn = Transaction(
            id=txn_id,
            user_id=user.id if user else None,
            amount=input_data.amount,
            transaction_time_hour=input_data.transaction_time_hour,
            transaction_frequency_24h=input_data.transaction_frequency_24h,
            merchant_category=input_data.merchant_category,
            merchant_name=input_data.merchant_name,
            location_risk_score=input_data.location_risk_score,
            device_risk_score=input_data.device_risk_score,
            distance_from_prev_km=input_data.distance_from_prev_km,
            prev_amount_ratio=input_data.prev_amount_ratio,
            account_age_days=input_data.account_age_days,
            failed_transactions_24h=input_data.failed_transactions_24h,
            is_international=input_data.is_international,
            is_online=input_data.is_online,
            notes=input_data.notes,
            created_at=datetime.now(timezone.utc)
        )
        db.add(txn)

        pred = Prediction(
            id=pred_id,
            transaction_id=txn_id,
            prediction=ml_res["prediction"],
            probability=ml_res["probability"],
            risk_score=ml_res["risk_score"],
            risk_level=ml_res["risk_level"],
            risk_factors=json.dumps(ml_res["risk_factors"]),
            recommendation=ml_res["recommendation"],
            status="analyzed",
            created_at=datetime.now(timezone.utc)
        )
        db.add(pred)
        db.commit()
        db.refresh(txn)
        db.refresh(pred)

        return PredictResponse(
            transaction_id=txn.id,
            prediction=pred.prediction,
            probability=pred.probability,
            risk_score=pred.risk_score,
            risk_level=pred.risk_level,
            risk_factors=ml_res["risk_factors"],
            recommendation=pred.recommendation,
            status=pred.status,
            created_at=pred.created_at,
            input_data=dict_data
        )

    @staticmethod
    async def process_batch_csv(
        db: Session,
        file: UploadFile,
        user: Optional[User] = None
    ) -> BatchPredictResponse:
        if not file.filename.endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be a CSV (.csv)"
            )

        try:
            content = await file.read()
            import io
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to parse CSV file: {str(e)}"
            )

        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty"
            )

        try:
            cleaned_df, warnings = validate_and_clean_transaction_df(df)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )

        results = predictor.predict_batch(cleaned_df)

        batch_items: List[BatchPredictionItem] = []
        legit_count = 0
        susp_count = 0
        fraud_count = 0
        total_risk_score = 0

        for res in results:
            txn_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
            pred_id = f"PRED-{uuid.uuid4().hex[:10].upper()}"
            
            p_val = res["prediction"]
            if p_val == "Legitimate":
                legit_count += 1
            elif p_val == "Suspicious":
                susp_count += 1
            else:
                fraud_count += 1

            total_risk_score += res["risk_score"]

            txn = Transaction(
                id=txn_id,
                user_id=user.id if user else None,
                amount=res["amount"],
                merchant_category=res["merchant_category"],
                created_at=datetime.now(timezone.utc)
            )
            pred = Prediction(
                id=pred_id,
                transaction_id=txn_id,
                prediction=res["prediction"],
                probability=res["probability"],
                risk_score=res["risk_score"],
                risk_level=res["risk_level"],
                risk_factors=json.dumps(res["risk_factors"]),
                recommendation=res["recommendation"],
                status="analyzed",
                created_at=datetime.now(timezone.utc)
            )
            db.add(txn)
            db.add(pred)

            batch_items.append(BatchPredictionItem(
                row_index=res["row_index"],
                transaction_id=txn_id,
                amount=res["amount"],
                merchant_category=res["merchant_category"],
                prediction=res["prediction"],
                probability=res["probability"],
                risk_score=res["risk_score"],
                risk_level=res["risk_level"],
                risk_factors=res["risk_factors"],
                recommendation=res["recommendation"]
            ))

        db.commit()

        total = len(batch_items)
        fraud_pct = round((fraud_count / total) * 100, 2) if total > 0 else 0.0
        avg_score = round(total_risk_score / total, 1) if total > 0 else 0.0

        return BatchPredictResponse(
            total_processed=total,
            legitimate_count=legit_count,
            suspicious_count=susp_count,
            fraudulent_count=fraud_count,
            fraud_percentage=fraud_pct,
            average_risk_score=avg_score,
            results=batch_items
        )
