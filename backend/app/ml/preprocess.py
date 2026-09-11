from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

NUMERICAL_FEATURES = [
    "amount",
    "transaction_time_hour",
    "transaction_frequency_24h",
    "location_risk_score",
    "device_risk_score",
    "distance_from_prev_km",
    "prev_amount_ratio",
    "account_age_days",
    "failed_transactions_24h",
    "is_international",
    "is_online"
]

CATEGORICAL_FEATURES = [
    "merchant_category"
]

ALL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

def get_preprocessor():
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor
