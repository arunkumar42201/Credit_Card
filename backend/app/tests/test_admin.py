import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_admin_token():
    res = client.post("/api/auth/login", json={"email": "admin@fraudguard.io", "password": "Admin@123456"})
    return res.json()["access_token"]

def get_user_token():
    res = client.post("/api/auth/login", json={"email": "user@fraudguard.io", "password": "User@123456"})
    return res.json()["access_token"]

def test_admin_access_allowed():
    token = get_admin_token()
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 3

def test_admin_access_forbidden_for_user():
    token = get_user_token()
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403

def test_admin_model_info():
    token = get_admin_token()
    res = client.get("/api/admin/model-info", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["model_name"] == "FraudGuard Ensemble Classifier"
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "roc_auc" in data
