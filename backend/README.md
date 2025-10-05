# GRIT-X-AWA Backend

FastAPI backend for exoplanet classification using ensemble ML models (Kepler & TESS datasets).

## 🚀 Quick Start

### Local Development

```bash
# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Access:**
- API Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000

### Docker (Production)

```bash
# Build and run
docker-compose up --build

# Deploy to Google Cloud Run
.\deploy.ps1
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/v1/           # API endpoints
│   │   ├── upload.py     # CSV upload & predictions
│   │   ├── predict.py    # Single predictions
│   │   ├── train.py      # Model training
│   │   └── stats.py      # Model statistics
│   ├── services/
│   │   ├── csv_service.py      # CSV processing & validation
│   │   ├── model_loader.py     # ML model loading
│   │   └── ml_service.py       # ML prediction service
│   ├── db/
│   │   ├── database.py         # Database connection
│   │   ├── supabase_client.py  # Supabase client
│   │   └── init_db.py          # DB initialization
│   └── main.py           # FastAPI app
├── kepler/               # Kepler ML models
│   ├── cat_model.pkl     # CatBoost model
│   ├── xgb_model.pkl     # XGBoost model
│   ├── lgbm_model.pkl    # LightGBM model
│   ├── imputer.pkl       # Data imputer
│   ├── encoders.pkl      # Label encoders
│   ├── target_le.pkl     # Target encoder
│   └── meta.json         # Model metadata
├── tess/                 # TESS ML models (same structure)
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── .env                 # Environment variables
```

---

## 🤖 ML Models

### Architecture

Each dataset (Kepler & TESS) uses an **ensemble of 3 gradient boosting models**:

1. **CatBoost** (40% weight) - Best for categorical features
2. **XGBoost** (35% weight) - Fast and efficient
3. **LightGBM** (25% weight) - Optimized for large datasets

**Prediction:** Weighted probability ensemble → `argmax(0.4×Cat + 0.35×XGB + 0.25×LGBM)`

### Kepler Dataset

**Features (21):** `koi_pdisposition`, `koi_score`, `koi_fpflag_nt`, `koi_fpflag_ss`, `koi_fpflag_co`, `koi_fpflag_ec`, `koi_period`, `koi_impact`, `koi_duration`, `koi_depth`, `koi_prad`, `koi_teq`, `koi_insol`, `koi_model_snr`, `koi_tce_plnt_num`, `koi_steff`, `koi_slogg`, `koi_srad`, `ra`, `dec`, `koi_kepmag`

**Classes:** `CANDIDATE`, `CONFIRMED`, `FALSE POSITIVE`

**Accuracy:** 95.2%

### TESS Dataset

**Features (15):** `ra`, `dec`, `st_teff`, `st_logg`, `st_rad`, `st_dist`, `st_pmra`, `st_pmdec`, `st_tmag`, `pl_orbper`, `pl_rade`, `pl_trandep`, `pl_trandurh`, `pl_eqt`, `pl_insol`

**Classes:** `APC`, `CP`, `FA`, `FP`, `KP`, `PC`

**Accuracy:** 92.7%

---

## 📡 API Endpoints

### Upload & Predict

**POST** `/api/v1/upload/csv`

Upload CSV file and get ML predictions.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/upload/csv" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@kepler_data.csv"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 150 predictions",
  "job_id": "a1b2c3d4-e5f6-7g8h-9i0j",
  "dataset_type": "kepler",
  "file_url": "https://...",
  "total_predictions": 150,
  "predictions": [
    {
      "row_index": 0,
      "predicted_class": "CONFIRMED",
      "confidence": {
        "CANDIDATE": 0.12,
        "CONFIRMED": 0.85,
        "FALSE POSITIVE": 0.03
      }
    }
  ]
}
```

### Other Endpoints

- `POST /predict` - Single prediction
- `POST /train` - Train new model
- `GET /stats` - Model statistics
- `GET /api/v1/predictions/recent` - Recent predictions
- `GET /api/v1/predictions/job/{job_id}` - Get predictions by job ID

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Supabase (optional for local dev)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=nasa-csv

# Database (optional for local dev)
DATABASE_URL=postgresql+asyncpg://postgres:password@db.supabase.co:5432/postgres
PG_DISABLE_SSL_VERIFY=true

# App
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### Local Mode

Backend runs in **LOCAL MODE** when database is unavailable:
- ✅ ML predictions work
- ✅ File upload processing works
- ❌ No database persistence (predictions not saved)
- ❌ No Supabase storage

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t grit-x-awa .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://..." \
  -e SUPABASE_URL="https://..." \
  grit-x-awa
```

### Google Cloud Run

```powershell
# Configure
$env:PROJECT_ID = "grit-x-awa"
$env:REGION = "europe-west1"

# Deploy
.\deploy.ps1
```

**Live Service:** https://grit-x-awa-1035421252747.europe-west1.run.app

---

## 🧪 Testing

### Test CSV Files

Use the sample files in the root directory:
- `test_kepler_sample.csv` - 10 rows of Kepler data
- `test_tess_sample.csv` - 10 rows of TESS data

### Upload Test

```bash
curl -X POST "http://localhost:8000/api/v1/upload/csv" \
  -F "file=@../test_kepler_sample.csv"
```

### Expected Flow

1. CSV uploaded
2. Auto-detect dataset type (Kepler/TESS)
3. Preprocess data (imputation, encoding)
4. Run ensemble predictions
5. Return results with confidence scores

---

## 📊 Performance

**Model Loading:** 2-3 seconds on startup (cached)

**Prediction Times (2 CPU, 2 GiB RAM):**
- 10 rows: ~2 seconds
- 100 rows: ~5 seconds
- 500 rows: ~15 seconds
- 1000 rows: ~30 seconds

---

## 🔧 Development

### Install Dependencies

```bash
pip install -r requirements.txt
```

**Main Dependencies:**
- FastAPI 0.115.0
- TensorFlow 2.18.0
- scikit-learn 1.6.1
- CatBoost 1.2.7
- XGBoost 2.1.3
- LightGBM 4.5.0
- Supabase 2.11.0
- SQLAlchemy 2.0.36

### Auto-Reload

Backend automatically reloads on code changes with `--reload` flag.

### Debugging

Check logs:
```bash
# Local
tail -f logs/app.log

# Docker
docker logs grit-x-awa

# Cloud Run
gcloud run services logs read grit-x-awa --region=europe-west1
```

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `TimeoutError: Connect call failed`

**Solution:** This is normal in local mode! Backend continues running without database.

### Missing ML Models

**Error:** `FileNotFoundError: cat_model.pkl`

**Solution:** Ensure `kepler/` and `tess/` directories contain all `.pkl` files.

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'catboost'`

**Solution:**
```bash
pip install catboost xgboost lightgbm
```

---

## 📝 License

MIT License - See LICENSE file

---

## 🔗 Links

- **Frontend:** `../frontend/`
- **API Docs:** http://localhost:8000/docs
- **Production:** https://grit-x-awa-1035421252747.europe-west1.run.app
