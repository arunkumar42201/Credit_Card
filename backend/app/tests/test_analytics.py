import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token():
    res = client.post("/api/auth/login", json={"email": "analyst@fraudguard.io", "password": "Analyst@123456"})
    return res.json()["access_token"]

def test_analytics_overview():
    token = get_token()
    res = client.get("/api/analytics/overview", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_transactions" in data
    assert "fraud_rate" in data
    assert "average_risk_score" in data

def test_analytics_trends():
    token = get_token()
    res = client.get("/api/analytics/trends?days=7", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0

def test_analytics_risk_distribution():
    token = get_token()
    res = client.get("/api/analytics/risk-distribution", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "low" in data
    assert "medium" in data
    assert "high" in data
    assert "critical" in data

def test_analytics_categories():
    token = get_token()
    res = client.get("/api/analytics/categories", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
