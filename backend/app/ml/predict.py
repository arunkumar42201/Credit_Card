import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

from app.config import settings
from app.ml.preprocess import ALL_FEATURES

class FraudPredictor:
    _instance = None
    _model = None
    _metrics = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = FraudPredictor()
        return cls._instance

    def __init__(self):
        self.load_model()

    def load_model(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "fraud_model.joblib")
        metrics_path = os.path.join(base_dir, "model_metrics.json")

        if os.path.exists(model_path):
            self._model = joblib.load(model_path)
            print("Loaded ML model from disk successfully.")
        else:
            print("Model artifact not found. Please run train.py first.")
            self._model = None

        if os.path.exists(metrics_path):
            with open(metrics_path, "r", encoding="utf-8") as f:
                self._metrics = json.load(f)
        else:
            self._metrics = None

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    @property
    def metrics(self) -> dict:
        return self._metrics or {
            "model_name": "Not Trained",
            "algorithm": "Not available",
            "trained_at": "Not available",
            "dataset_size": 0,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "roc_auc": 0.0,
            "pr_auc": 0.0,
            "confusion_matrix": {"true_negatives": 0, "false_positives": 0, "false_negatives": 0, "true_positives": 0},
            "top_features": []
        }

    def _determine_risk_level_and_prediction(self, risk_score: int) -> Tuple[str, str, str]:
        """
        Classify risk level, prediction category, and recommendation based on configurable thresholds.
        0 - 30: LOW -> Legitimate
        31 - 60: MEDIUM -> Suspicious
        61 - 85: HIGH -> Fraudulent
        86 - 100: CRITICAL -> Fraudulent
        """
        thresholds = settings.RISK_THRESHOLDS
        low_max = thresholds.get("LOW_MAX", 30)
        med_max = thresholds.get("MEDIUM_MAX", 60)
        high_max = thresholds.get("HIGH_MAX", 85)

        if risk_score <= low_max:
            return "LOW", "Legitimate", "Transaction approved. All risk indicators within normal parameters."
        elif risk_score <= med_max:
            return "MEDIUM", "Suspicious", "Transaction flagged for step-up verification (e.g. OTP, 2FA, or customer notification)."
        elif risk_score <= high_max:
            return "HIGH", "Fraudulent", "Transaction placed on temporary hold. Requires manual review by fraud analyst."
        else:
            return "CRITICAL", "Fraudulent", "Transaction declined immediately. Critical fraud indicators detected; recommend temporary card lock."

    def _extract_risk_factors(self, data: Dict[str, Any], proba: float) -> List[str]:
        """
        Explainable AI: Derive explainable risk factors contributing to the score.
        """
        factors = []
        amount = float(data.get("amount", 0))
        prev_ratio = float(data.get("prev_amount_ratio", 1.0))
        failed_count = int(data.get("failed_transactions_24h", 0))
        loc_risk = float(data.get("location_risk_score", 0.0))
        dev_risk = float(data.get("device_risk_score", 0.0))
        distance = float(data.get("distance_from_prev_km", 0.0))
        freq = int(data.get("transaction_frequency_24h", 1))
        hour = int(data.get("transaction_time_hour", 12))
        is_intl = int(data.get("is_international", 0))
        is_online = int(data.get("is_online", 1))
        category = str(data.get("merchant_category", "")).lower()
        acc_age = int(data.get("account_age_days", 365))

        if prev_ratio >= 3.0 or amount >= 1500:
            factors.append(f"Unusually high transaction amount (${amount:,.2f}, {prev_ratio:.1f}x higher than 30-day baseline)")
        if failed_count >= 2:
            factors.append(f"Multiple recent authorization failures ({failed_count} failed attempts in 24h)")
        if distance >= 300:
            factors.append(f"High geographical velocity anomaly ({distance:,.1f} km from prior transaction location)")
        if loc_risk >= 0.55:
            factors.append(f"Elevated IP/geolocation risk index ({loc_risk:.2f}/1.0)")
        if dev_risk >= 0.55:
            factors.append(f"Suspicious or unverified device fingerprint ({dev_risk:.2f}/1.0)")
        if freq >= 6:
            factors.append(f"Velocity surge: {freq} transactions initiated within a 24-hour window")
        if hour in [1, 2, 3, 4] and amount > 200:
            factors.append(f"Off-hours transaction initiated at {hour:02d}:00")
        if is_intl == 1 and distance > 1000:
            factors.append("Cross-border foreign transaction with substantial geographic displacement")
        if category in ["electronics", "travel", "jewelry"] and amount > 500:
            factors.append(f"High-risk merchant sector ({category.title()}) with substantial value")
        if acc_age < 30:
            factors.append(f"Newly activated account profile ({acc_age} days old)")

        if not factors:
            if proba >= 0.3:
                factors.append("Compound multi-feature risk interaction identified by ensemble model")
            else:
                factors.append("Standard transaction pattern consistent with verified customer behavior")

        return factors[:5]

    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_ready:
            self.load_model()
            if not self.is_ready:
                raise RuntimeError("ML model is not available. Train the model first.")

        df = pd.DataFrame([data])
        # Ensure all features exist
        for col in ALL_FEATURES:
            if col not in df.columns:
                df[col] = 0

        X = df[ALL_FEATURES]
        proba = float(self._model.predict_proba(X)[0][1])
        risk_score = int(round(proba * 100))
        risk_level, prediction, recommendation = self._determine_risk_level_and_prediction(risk_score)
        risk_factors = self._extract_risk_factors(data, proba)

        return {
            "prediction": prediction,
            "probability": round(proba, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommendation": recommendation,
            "status": "analyzed"
        }

    def predict_batch(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if not self.is_ready:
            self.load_model()
            if not self.is_ready:
                raise RuntimeError("ML model is not available. Train the model first.")

        for col in ALL_FEATURES:
            if col not in df.columns:
                df[col] = 0

        X = df[ALL_FEATURES]
        probas = self._model.predict_proba(X)[:, 1]

        results = []
        for i, proba in enumerate(probas):
            row_data = df.iloc[i].to_dict()
            p = float(proba)
            risk_score = int(round(p * 100))
            risk_level, pred, rec = self._determine_risk_level_and_prediction(risk_score)
            factors = self._extract_risk_factors(row_data, p)
            results.append({
                "row_index": i + 1,
                "prediction": pred,
                "probability": round(p, 4),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": factors,
                "recommendation": rec,
                "amount": float(row_data.get("amount", 0)),
                "merchant_category": str(row_data.get("merchant_category", "retail"))
            })
        return results

predictor = FraudPredictor.get_instance()
