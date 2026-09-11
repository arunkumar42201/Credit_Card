import os
import numpy as np
import pandas as pd

def normalize_prob(p_list):
    arr = np.array(p_list, dtype=float)
    return arr / arr.sum()

def generate_synthetic_data(n_samples: int = 15000, fraud_rate: float = 0.08, random_state: int = 42):
    """
    Generate realistic synthetic credit card transaction dataset.
    Features follow empirical fraud behavioral patterns.
    """
    np.random.seed(random_state)
    n_fraud = int(n_samples * fraud_rate)
    n_legit = n_samples - n_fraud

    categories = ["grocery", "electronics", "travel", "dining", "clothing", "entertainment", "gas_transport", "health_beauty", "utilities", "retail"]
    
    # --- LEGITIMATE TRANSACTIONS ---
    legit_amount = np.random.lognormal(mean=3.8, sigma=0.8, size=n_legit).clip(5.0, 850.0)
    
    hour_p_legit = normalize_prob([0.01, 0.01, 0.005, 0.005, 0.01, 0.02, 0.04, 0.06, 0.07, 0.08, 0.08, 0.08, 
                                   0.08, 0.07, 0.07, 0.07, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.015, 0.01])
    legit_hour = np.random.choice(range(24), size=n_legit, p=hour_p_legit)
    legit_freq = np.random.poisson(lam=1.8, size=n_legit).clip(1, 8)
    
    cat_p_legit = normalize_prob([0.24, 0.06, 0.05, 0.18, 0.10, 0.07, 0.14, 0.06, 0.05, 0.05])
    legit_category = np.random.choice(categories, size=n_legit, p=cat_p_legit)
    
    legit_loc_risk = np.random.beta(a=1.2, b=8.0, size=n_legit).clip(0.01, 0.45)
    legit_dev_risk = np.random.beta(a=1.5, b=7.0, size=n_legit).clip(0.01, 0.50)
    legit_distance = np.random.exponential(scale=12.0, size=n_legit).clip(0.1, 120.0)
    legit_amount_ratio = np.random.normal(loc=1.0, scale=0.3, size=n_legit).clip(0.2, 2.8)
    legit_acc_age = np.random.uniform(low=180, high=3600, size=n_legit).astype(int)
    legit_failed = np.random.choice([0, 1, 2], size=n_legit, p=normalize_prob([0.94, 0.05, 0.01]))
    legit_intl = np.random.choice([0, 1], size=n_legit, p=normalize_prob([0.94, 0.06]))
    legit_online = np.random.choice([0, 1], size=n_legit, p=normalize_prob([0.45, 0.55]))
    legit_fraud = np.zeros(n_legit, dtype=int)

    # --- FRAUDULENT TRANSACTIONS ---
    fraud_amount = np.random.lognormal(mean=6.2, sigma=1.1, size=n_fraud).clip(120.0, 4800.0)
    
    hour_p_fraud = normalize_prob([0.08, 0.10, 0.12, 0.12, 0.11, 0.07, 0.04, 0.02, 0.02, 0.02, 0.02, 0.02, 
                                   0.02, 0.02, 0.02, 0.02, 0.03, 0.03, 0.03, 0.03, 0.03, 0.04, 0.05, 0.06])
    fraud_hour = np.random.choice(range(24), size=n_fraud, p=hour_p_fraud)
    fraud_freq = np.random.poisson(lam=7.2, size=n_fraud).clip(2, 25)
    
    cat_p_fraud = normalize_prob([0.02, 0.32, 0.28, 0.03, 0.16, 0.06, 0.03, 0.03, 0.01, 0.06])
    fraud_category = np.random.choice(categories, size=n_fraud, p=cat_p_fraud)
    
    fraud_loc_risk = np.random.beta(a=6.0, b=2.0, size=n_fraud).clip(0.40, 0.99)
    fraud_dev_risk = np.random.beta(a=5.5, b=2.2, size=n_fraud).clip(0.35, 0.99)
    fraud_distance = np.random.exponential(scale=650.0, size=n_fraud).clip(15.0, 4900.0)
    fraud_amount_ratio = np.random.normal(loc=5.5, scale=2.5, size=n_fraud).clip(1.8, 16.0)
    fraud_acc_age = np.random.exponential(scale=180, size=n_fraud).clip(1, 1200).astype(int)
    fraud_failed = np.random.choice([0, 1, 2, 3, 4], size=n_fraud, p=normalize_prob([0.15, 0.25, 0.30, 0.20, 0.10]))
    fraud_intl = np.random.choice([0, 1], size=n_fraud, p=normalize_prob([0.42, 0.58]))
    fraud_online = np.random.choice([0, 1], size=n_fraud, p=normalize_prob([0.12, 0.88]))
    fraud_fraud = np.ones(n_fraud, dtype=int)

    # Combine
    data = {
        "amount": np.round(np.concatenate([legit_amount, fraud_amount]), 2),
        "transaction_time_hour": np.concatenate([legit_hour, fraud_hour]),
        "transaction_frequency_24h": np.concatenate([legit_freq, fraud_freq]),
        "merchant_category": np.concatenate([legit_category, fraud_category]),
        "location_risk_score": np.round(np.concatenate([legit_loc_risk, fraud_loc_risk]), 3),
        "device_risk_score": np.round(np.concatenate([legit_dev_risk, fraud_dev_risk]), 3),
        "distance_from_prev_km": np.round(np.concatenate([legit_distance, fraud_distance]), 1),
        "prev_amount_ratio": np.round(np.concatenate([legit_amount_ratio, fraud_amount_ratio]), 2),
        "account_age_days": np.concatenate([legit_acc_age, fraud_acc_age]),
        "failed_transactions_24h": np.concatenate([legit_failed, fraud_failed]),
        "is_international": np.concatenate([legit_intl, fraud_intl]),
        "is_online": np.concatenate([legit_online, fraud_online]),
        "is_fraud": np.concatenate([legit_fraud, fraud_fraud])
    }

    df = pd.DataFrame(data)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    
    os.makedirs("backend/data", exist_ok=True)
    csv_path = "backend/data/synthetic_transactions.csv"
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} synthetic transactions (Fraud rate: {df['is_fraud'].mean()*100:.2f}%) -> {csv_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
