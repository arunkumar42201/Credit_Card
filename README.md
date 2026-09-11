# FraudGuard AI - Credit Card Fraud Detection System

A complete, production-style **Full-Stack Credit Card Fraud Detection Web Application** built with a modern React.js frontend, a high-performance Python FastAPI backend, a real Scikit-learn Machine Learning ensemble pipeline with explainable predictions, and comprehensive Role-Based Access Control (User, Analyst, Admin).

---

## 1. System Architecture

```
                                  +---------------------------------------------+
                                  |         React 18 + Vite Web Client          |
                                  |   Tailwind CSS | Recharts | Lucide Icons    |
                                  |   React Router v6 | Axios | Context API     |
                                  +----------------------+----------------------+
                                                         |
                                                         | REST / HTTP / JWT Bearer
                                                         v
                                  +---------------------------------------------+
                                  |            FastAPI Python Backend           |
                                  |   Pydantic v2 | SQLAlchemy 2.0 | PyJWT/Bcrypt
                                  |   RBAC: User | Analyst | Admin              |
                                  +-----------+-------------------------+-------+
                                              |                         |
                                              v                         v
                                  +-----------------------+ +-----------------------+
                                  |    SQLite Database    | | Scikit-learn Pipeline |
                                  | Users, Transactions,  | | RandomForest Classifier
                                  | Predictions           | | Explainable Factors   |
                                  +-----------------------+ +-----------------------+
```

---

## 2. Key Features

- **Machine Learning Inference:** Random Forest pipeline trained on realistic synthetic transaction data with balanced subsampling for extreme class imbalance.
- **Explainable Predictions:** Outputs probability confidence, 0-100 risk score, risk level (LOW, MEDIUM, HIGH, CRITICAL), top local risk factor contributors, and actionable guidance.
- **Role-Based Access Control (RBAC):**
  - **User:** Personal dashboard, single transaction scoring, transaction history, CSV batch detection.
  - **Analyst:** Advanced multi-dimensional analytics, transaction supervision, batch CSV detection, results export.
  - **Admin:** Admin control center, user management (enable/disable, change role, delete), real ML model performance metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, Feature Importance).
- **Interactive Single Transaction Analyzer:** Includes 1-click test scenario presets (*Legitimate Coffee Purchase*, *Suspicious Evening Spike*, *Critical Fraud Anomaly*).
- **Batch CSV Detection:** Drag-and-drop file upload, downloadable sample CSV template, upload progress bar, batch summary cards, and CSV export.
- **Interactive Analytics:** Multi-dimensional charts powered by Recharts (Fraud curve, Risk distribution, Category exposure, Volume trends).
- **Zero Sensitive Financial Data:** No full credit card PANs, CVVs, PINs, or banking passwords are ever requested or stored.

---

## 3. Demo Credentials

Quick 1-click login buttons are provided on the Login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@fraudguard.io` | `Admin@123456` | Full platform supervision, user management, true model metrics |
| **Analyst** | `analyst@fraudguard.io` | `Analyst@123456` | Advanced analytics, batch processing, transaction audit |
| **User** | `user@fraudguard.io` | `User@123456` | Personal transaction analysis & history |

---

## 4. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm

---

### Step 1: Start the Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .env\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Train the Machine Learning model (produces `fraud_model.joblib` and `model_metrics.json`):
   ```bash
   python -m app.ml.train
   ```

5. Seed the database with default accounts and baseline transactions:
   ```bash
   python -m app.utils.seed
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will run at `http://localhost:8000`.*
   *Interactive API documentation (Swagger UI): `http://localhost:8000/docs`.*
   *Health Check: `http://localhost:8000/api/health`.*

---

### Step 2: Start the Frontend

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run at `http://localhost:5173`.*

   ---

   ## 5. Deploy on Render and Vercel

   ### Backend on Render

   This repository includes `render.yaml`. Create a new Render Blueprint from the repository; it will use `backend` as the service root and start FastAPI with Render's `$PORT`.

   Set these environment variables on the Render web service:

   ```text
   SECRET_KEY=<long-random-production-secret>
   DATABASE_URL=<Render PostgreSQL connection string>
   FRONTEND_URL=https://<your-vercel-project>.vercel.app
   FRONTEND_URLS=https://<your-vercel-project>.vercel.app
   ```

   Use the Render service URL to verify the backend at `/api/health`.

   ### Frontend on Vercel

   Create a Vercel project with `frontend` as the Root Directory. Vercel detects the Vite build automatically; `frontend/vercel.json` keeps client-side routes working after refresh.

   Set this Vercel environment variable for Production (and Preview if needed):

   ```text
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```

   Redeploy the frontend after setting the variable. The browser must call the Render URL, not `localhost`.

---

   ## 6. Running Automated Backend Tests

Run the Pytest suite covering authentication, RBAC, single predictions, batch predictions, analytics, and admin endpoints:

```bash
cd backend
pytest app/tests -v
```

All 16 tests verify:
- Health check endpoint
- JWT generation and invalid credentials handling
- Duplicate email prevention
- Low-risk and high-risk prediction scoring
- Batch CSV file ingestion & validation
- Analytics trends and risk distribution
- Admin RBAC protection (forbidding normal users from admin APIs)
- Admin model information retrieval

---

## 7. API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create account (User or Analyst)
- `POST /api/auth/login` - Authenticate and obtain JWT token
- `GET /api/auth/me` - Current authenticated user
- `POST /api/auth/logout` - Discard session

### Predictions
- `POST /api/predictions/predict` - Real-time individual transaction scoring
- `POST /api/predictions/batch` - High-throughput CSV file batch scoring
- `GET /api/predictions/history` - User's scoring history
- `GET /api/predictions/{id}` - Detailed prediction inspection

### Transactions
- `GET /api/transactions` - Filterable and paginated transaction list
- `GET /api/transactions/{id}` - Single transaction details
- `DELETE /api/transactions/{id}` - Delete transaction record

### Analytics
- `GET /api/analytics/overview` - KPI statistics (Total, Fraud, Suspicious, Volume)
- `GET /api/analytics/trends` - Daily volume and fraud incidence curve
- `GET /api/analytics/risk-distribution` - Risk tier counts (Low, Medium, High, Critical)
- `GET /api/analytics/categories` - Exposure breakdown by merchant sector

### Admin
- `GET /api/admin/users` - User directory with role and status filters
- `PATCH /api/admin/users/{id}/status` - Enable or disable user access
- `PATCH /api/admin/users/{id}/role` - Adjust user role (user, analyst, admin)
- `DELETE /api/admin/users/{id}` - Delete user account
- `GET /api/admin/statistics` - Platform-wide telemetry
- `GET /api/admin/model-info` - Real Scikit-learn test metrics and feature importances

---

## 8. Machine Learning Model Details

- **Algorithm:** Random Forest Classifier with Balanced Stratified Subsampling
- **Input Features (12):**
  1. `amount` (USD transaction value)
  2. `transaction_time_hour` (0 to 23)
  3. `transaction_frequency_24h` (Recent velocity)
  4. `merchant_category` (One-hot encoded)
  5. `location_risk_score` (IP/geolocation risk index)
  6. `device_risk_score` (Device fingerprint risk)
  7. `distance_from_prev_km` (Geographical displacement)
  8. `prev_amount_ratio` (Ratio to customer 30-day average amount)
  9. `account_age_days` (Account age)
  10. `failed_transactions_24h` (Failed authorization attempts)
  11. `is_international` (1 = Cross-border, 0 = Domestic)
  12. `is_online` (1 = E-commerce, 0 = POS)
- **Evaluation Metrics (Held-out Test Dataset):**
  - **Accuracy:** 100.0%
  - **Fraud Recall:** 100.0%
  - **Precision:** 100.0%
  - **F1-Score:** 100.0%
  - **ROC-AUC:** 1.0000
  - **PR-AUC:** 1.0000
- **Thresholds:**
  - 0–30: **LOW** (Legitimate - approve)
  - 31–60: **MEDIUM** (Suspicious - secondary authentication)
  - 61–85: **HIGH** (High Risk - hold for analyst review)
  - 86–100: **CRITICAL** (Fraudulent - block immediately)
