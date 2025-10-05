# 🪐 GRIT-X-AWA - Exoplanet ML Explorer

Interactive web platform for NASA exoplanet classification using machine learning. Upload CSV data and get instant predictions from ensemble ML models trained on Kepler and TESS missions.

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro)](https://astro.build)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:4325
- Backend API: http://localhost:8000/docs

---

## 📊 Features

- ✅ **ML Predictions** - Upload CSV, get exoplanet classifications
- ✅ **Auto-Detection** - Automatically detects Kepler or TESS dataset
- ✅ **Ensemble Models** - CatBoost + XGBoost + LightGBM
- ✅ **Beautiful UI** - Dark/light mode, responsive design
- ✅ **Export Results** - Download predictions as CSV/JSON
- ✅ **Production Ready** - Deployed on Google Cloud Run

---

## 🤖 ML Models

### Kepler (21 features)
**Classes:** CANDIDATE, CONFIRMED, FALSE POSITIVE  
**Accuracy:** 95.2%

### TESS (15 features)
**Classes:** APC, CP, FA, FP, KP, PC  
**Accuracy:** 92.7%

---

## 📁 Project Structure

```
GRIT-X-AWA/
├── backend/              # FastAPI + ML models
│   ├── app/             # API endpoints & services
│   ├── kepler/          # Kepler ML models
│   ├── tess/            # TESS ML models
│   └── README.md        # Backend documentation
├── frontend/            # Astro + React
│   ├── src/            # Components & pages
│   └── README.md       # Frontend documentation
├── test_kepler_sample.csv   # Sample Kepler data
└── test_tess_sample.csv     # Sample TESS data
```

---

## 🧪 Test It Now

1. Start backend and frontend (see Quick Start)
2. Go to http://localhost:4325/dashboard
3. Upload `test_kepler_sample.csv`
4. Click "Run ML Analysis"
5. See predictions with confidence scores!

---

## 🌐 Live Demo

**Production API:** https://grit-x-awa-1035421252747.europe-west1.run.app

---

## 📖 Documentation

- **Backend:** See `backend/README.md`
- **Frontend:** See `frontend/README.md`

---

## 🛠️ Tech Stack

**Backend:**
- FastAPI, Python 3.11
- TensorFlow, scikit-learn
- CatBoost, XGBoost, LightGBM
- Supabase (PostgreSQL)

**Frontend:**
- Astro, React, TypeScript
- Tailwind CSS
- Chart.js

---

## 📝 License

MIT License