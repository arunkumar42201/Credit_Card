import importlib
import os
from typing import Any, Dict

try:
    settings_module = importlib.import_module("pydantic_settings")
    BaseSettings = settings_module.BaseSettings
    SettingsConfigDict = settings_module.SettingsConfigDict
except ModuleNotFoundError:
    try:
        pydantic_module = importlib.import_module("pydantic")
        BaseSettings = getattr(pydantic_module, "BaseSettings")
        SettingsConfigDict = getattr(
            pydantic_module,
            "ConfigDict",
            lambda **kwargs: kwargs,
        )
    except (ImportError, AttributeError):

        def SettingsConfigDict(**kwargs: Any) -> Any:
            return kwargs

        class BaseSettings:
            def __init__(self, **kwargs: Any) -> None:
                for key, value in kwargs.items():
                    setattr(self, key, value)

class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudGuard AI - Credit Card Fraud Detection"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fraudguard-super-secret-jwt-key-2026-production-grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./creditcard_fraud.db")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    FRONTEND_URLS: str = os.getenv("FRONTEND_URLS", "")
    
    # Risk Score Thresholds (Configurable)
    # 0 - 30: LOW, 31 - 60: MEDIUM, 61 - 85: HIGH, 86 - 100: CRITICAL
    RISK_THRESHOLDS: Dict[str, int] = {
        "LOW_MAX": 30,
        "MEDIUM_MAX": 60,
        "HIGH_MAX": 85,
        "CRITICAL_MAX": 100
    }

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
