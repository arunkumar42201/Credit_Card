import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["model_ready"] is True

def test_user_login():
    res = client.post("/api/auth/login", json={
        "email": "user@fraudguard.io",
        "password": "User@123456"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "user"

def test_admin_login():
    res = client.post("/api/auth/login", json={
        "email": "admin@fraudguard.io",
        "password": "Admin@123456"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_invalid_login():
    res = client.post("/api/auth/login", json={
        "email": "user@fraudguard.io",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401

def test_register_duplicate():
    res = client.post("/api/auth/register", json={
        "name": "Duplicate User",
        "email": "user@fraudguard.io",
        "password": "User@123456",
        "role": "user"
    })
    assert res.status_code == 400
