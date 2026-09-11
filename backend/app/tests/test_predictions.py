import pytest
import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(email="user@fraudguard.io", pwd="User@123456"):
    res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    return res.json()["access_token"]

def test_single_prediction_legit():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "amount": 35.00,
        "transaction_time_hour": 14,
        "transaction_frequency_24h": 2,
        "merchant_category": "grocery",
        "location_risk_score": 0.05,
        "device_risk_score": 0.05,
        "distance_from_prev_km": 2.0,
        "prev_amount_ratio": 0.9,
        "account_age_days": 400,
        "failed_transactions_24h": 0,
        "is_international": 0,
        "is_online": 1
    }
    
    res = client.post("/api/predictions/predict", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction"] == "Legitimate"
    assert data["risk_level"] == "LOW"
    assert data["risk_score"] <= 30
    assert "recommendation" in data
    assert len(data["risk_factors"]) > 0

def test_single_prediction_fraud():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "amount": 3950.00,
        "transaction_time_hour": 3,
        "transaction_frequency_24h": 12,
        "merchant_category": "electronics",
        "location_risk_score": 0.95,
        "device_risk_score": 0.90,
        "distance_from_prev_km": 2400.0,
        "prev_amount_ratio": 9.2,
        "account_age_days": 12,
        "failed_transactions_24h": 3,
        "is_international": 1,
        "is_online": 1
    }
    
    res = client.post("/api/predictions/predict", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert data["prediction"] == "Fraudulent"
    assert data["risk_score"] > 60

def test_batch_prediction_csv():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    csv_content = """amount,merchant_category,transaction_time_hour,transaction_frequency_24h,location_risk_score,device_risk_score,distance_from_prev_km,prev_amount_ratio,account_age_days,failed_transactions_24h,is_international,is_online
45.00,grocery,12,1,0.05,0.05,2.0,1.0,500,0,0,1
3500.00,electronics,3,10,0.92,0.88,2000.0,8.5,15,3,1,1
"""
    files = {"file": ("test.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    res = client.post("/api/predictions/batch", files=files, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_processed"] == 2
    assert len(data["results"]) == 2

def test_prediction_history():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/predictions/history?limit=10", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
