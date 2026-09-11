import os
import json
from datetime import datetime
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix
)

from app.ml.preprocess import get_preprocessor, ALL_FEATURES
from app.ml.generate_data import generate_synthetic_data

def train_model():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(ml_dir, "..", "..", "data"))
    data_path = os.path.join(data_dir, "synthetic_transactions.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Generating synthetic dataset...")
        df = generate_synthetic_data(n_samples=15000, fraud_rate=0.08)
    else:
        df = pd.read_csv(data_path)

    X = df[ALL_FEATURES]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training dataset: {X_train.shape[0]} samples, Testing dataset: {X_test.shape[0]} samples")

    preprocessor = get_preprocessor()
    classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )

    model_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", classifier)
    ])

    print("Training Random Forest Classifier pipeline...")
    model_pipeline.fit(X_train, y_train)

    # Predictions & probabilities on test set
    y_pred = model_pipeline.predict(X_test)
    y_proba = model_pipeline.predict_proba(X_test)[:, 1]

    # True evaluation metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    pr_auc = float(average_precision_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred)

    print("\n=== REAL MODEL EVALUATION METRICS ===")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f} (High fraud detection coverage)")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")
    print(f"Confusion Matrix:\n{cm}\n")

    # Extract Feature Importances
    # Get feature names from preprocessor
    cat_encoder = model_pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_features = list(cat_encoder.get_feature_names_out(["merchant_category"]))
    from app.ml.preprocess import NUMERICAL_FEATURES
    all_feature_names = NUMERICAL_FEATURES + cat_features
    importances = model_pipeline.named_steps["classifier"].feature_importances_

    feature_imp_list = []
    for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:10]:
        clean_name = name.replace("merchant_category_", "cat: ")
        feature_imp_list.append({"feature": clean_name, "importance": round(float(imp), 4)})

    metrics_data = {
        "model_name": "FraudGuard Ensemble Classifier",
        "algorithm": "Random Forest with Balanced Stratified Subsampling",
        "trained_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "dataset_size": len(df),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": {
            "true_negatives": int(cm[0][0]),
            "false_positives": int(cm[0][1]),
            "false_negatives": int(cm[1][0]),
            "true_positives": int(cm[1][1])
        },
        "top_features": feature_imp_list
    }

    # Save model
    model_path = os.path.join(ml_dir, "fraud_model.joblib")
    joblib.dump(model_pipeline, model_path)
    print(f"Saved model pipeline to {model_path}")

    # Save metrics JSON
    metrics_path = os.path.join(ml_dir, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved model metrics to {metrics_path}")

    return metrics_data

if __name__ == "__main__":
    train_model()
