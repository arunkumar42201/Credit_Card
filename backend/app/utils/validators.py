import pandas as pd
from typing import Tuple, List

REQUIRED_CSV_COLUMNS = [
    "amount",
    "merchant_category"
]

OPTIONAL_CSV_COLUMNS = [
    "transaction_time_hour",
    "transaction_frequency_24h",
    "location_risk_score",
    "device_risk_score",
    "distance_from_prev_km",
    "prev_amount_ratio",
    "account_age_days",
    "failed_transactions_24h",
    "is_international",
    "is_online",
    "notes",
    "merchant_name"
]

DEFAULT_VALUES = {
    "transaction_time_hour": 12,
    "transaction_frequency_24h": 1,
    "location_risk_score": 0.1,
    "device_risk_score": 0.1,
    "distance_from_prev_km": 5.0,
    "prev_amount_ratio": 1.0,
    "account_age_days": 365,
    "failed_transactions_24h": 0,
    "is_international": 0,
    "is_online": 1,
    "notes": None,
    "merchant_name": None
}

def validate_and_clean_transaction_df(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    warnings = []
    # Normalize column names: lowercase, strip whitespace, replace spaces with underscores
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    # Check required columns
    missing_required = [c for c in REQUIRED_CSV_COLUMNS if c not in df.columns]
    if missing_required:
        raise ValueError(f"Missing required columns in CSV: {', '.join(missing_required)}")
    
    # Fill optional missing columns with defaults
    for col, default_val in DEFAULT_VALUES.items():
        if col not in df.columns:
            df[col] = default_val
            warnings.append(f"Column '{col}' was missing, populated with default value ({default_val}).")
        else:
            df[col] = df[col].fillna(default_val)
            
    # Clean and cast numerical columns
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(50.0)
    df["amount"] = df["amount"].apply(lambda x: max(0.01, float(x)))
    
    df["transaction_time_hour"] = pd.to_numeric(df["transaction_time_hour"], errors="coerce").fillna(12).astype(int).clip(0, 23)
    df["transaction_frequency_24h"] = pd.to_numeric(df["transaction_frequency_24h"], errors="coerce").fillna(1).astype(int).clip(1, 100)
    df["location_risk_score"] = pd.to_numeric(df["location_risk_score"], errors="coerce").fillna(0.1).astype(float).clip(0.0, 1.0)
    df["device_risk_score"] = pd.to_numeric(df["device_risk_score"], errors="coerce").fillna(0.1).astype(float).clip(0.0, 1.0)
    df["distance_from_prev_km"] = pd.to_numeric(df["distance_from_prev_km"], errors="coerce").fillna(5.0).astype(float).clip(lower=0.0)
    df["prev_amount_ratio"] = pd.to_numeric(df["prev_amount_ratio"], errors="coerce").fillna(1.0).astype(float).clip(lower=0.0)
    df["account_age_days"] = pd.to_numeric(df["account_age_days"], errors="coerce").fillna(365).astype(int).clip(lower=0)
    df["failed_transactions_24h"] = pd.to_numeric(df["failed_transactions_24h"], errors="coerce").fillna(0).astype(int).clip(lower=0)
    df["is_international"] = pd.to_numeric(df["is_international"], errors="coerce").fillna(0).astype(int).clip(0, 1)
    df["is_online"] = pd.to_numeric(df["is_online"], errors="coerce").fillna(1).astype(int).clip(0, 1)
    
    # Clean categorical
    df["merchant_category"] = df["merchant_category"].astype(str).str.strip().str.lower()
    valid_categories = {"grocery", "electronics", "travel", "dining", "clothing", "entertainment", "gas_transport", "health_beauty", "utilities", "retail"}
    df["merchant_category"] = df["merchant_category"].apply(lambda c: c if c in valid_categories else "retail")
    
    return df, warnings
