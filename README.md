# 🪐 GRIT-X-AWA - Exoplanet ML Explorer

> An interactive web platform for NASA exoplanet classification using ensemble machine learning models trained on Kepler and TESS mission data.

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro)](https://astro.build)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [ML Models](#-ml-models)
- [API Documentation](#-api-documentation)
- [External Resources & APIs](#-external-resources--apis)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

GRIT-X-AWA is a full-stack machine learning application that empowers astronomers and researchers to classify exoplanets using state-of-the-art ensemble ML models. Upload CSV datasets from NASA's Kepler or TESS missions and receive instant predictions with confidence scores, visualizations, and detailed analytics.

**Live Demo:** [https://grit-x-awa-1035421252747.europe-west1.run.app](https://grit-x-awa-1035421252747.europe-west1.run.app)

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Astro + React Frontend (Port 4325)                       │  │
│  │  • Static site generation with Astro                      │  │
│  │  • Dynamic React components for interactivity             │  │
│  │  • Tailwind CSS for styling                               │  │
│  │  • Three.js for 3D visualizations                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend (Port 8000)                              │  │
│  │  • RESTful API endpoints                                  │  │
│  │  • CORS middleware                                        │  │
│  │  • Request validation (Pydantic)                          │  │
│  │  • Auto-generated OpenAPI docs                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  CSV Service     │  │  ML Service      │  │ Model Loader  │ │
│  │  • File upload   │  │  • Predictions   │  │ • Lazy load   │ │
│  │  • Validation    │  │  • Ensembling    │  │ • Caching     │ │
│  │  • Parsing       │  │  • Auto-detect   │  │ • Registry    │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         ML MODEL LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ensemble Models (Kepler & TESS)                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │   │
│  │  │  CatBoost  │  │  XGBoost   │  │  LightGBM         │ │   │
│  │  │  (40%)     │  │  (35%)     │  │  (25%)            │ │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │   │
│  │                                                          │   │
│  │  • Weighted voting for final predictions                │   │
│  │  • Confidence score aggregation                         │   │
│  │  • Soft voting for probability distribution             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Supabase (PostgreSQL + Storage)                         │   │
│  │  • User authentication & authorization                   │   │
│  │  • Dataset metadata storage                              │   │
│  │  • Prediction history logs                               │   │
│  │  • File storage (CSV uploads)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### **Frontend Architecture**

```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero.tsx                      # Landing page hero
│   │   ├── SpaceScene.tsx                # 3D space background
│   │   ├── DashboardLayoutComponent.tsx  # Main dashboard layout
│   │   ├── PredictionResults.tsx         # Full-page results modal
│   │   ├── ThemeToggle.tsx               # Dark/light mode
│   │   └── pages/
│   │       ├── Dashboard.tsx             # Main dashboard view
│   │       ├── RunAnalysis.tsx           # File upload & ML analysis
│   │       ├── Predictions.tsx           # Prediction history
│   │       ├── Visualizations.tsx        # Data visualizations
│   │       └── analysis/
│   │           ├── DataAnalysis.tsx      # Statistical analysis
│   │           └── ExoplanetVisualization3D.tsx  # 3D planet viz
│   ├── pages/
│   │   ├── index.astro                   # Landing page
│   │   └── dashboard.astro               # Dashboard entry point
│   ├── services/
│   │   └── api.ts                        # API client service
│   └── context/
│       └── SharedContext.tsx             # Global state management
```

**Key Design Patterns:**
- **Context API** for global state management
- **Component composition** for reusability
- **Lazy loading** for 3D scenes and heavy components
- **Server-side rendering** with Astro for SEO

#### **Backend Architecture**

```
backend/
├── app/
│   ├── main.py                           # FastAPI application entry
│   ├── api/v1/                           # API route handlers
│   │   ├── predict.py                    # Prediction endpoints
│   │   ├── upload.py                     # File upload handling
│   │   ├── analysis.py                   # Data analysis endpoints
│   │   ├── predictions.py                # Prediction history
│   │   ├── models.py                     # Model info endpoints
│   │   ├── stats.py                      # Statistics endpoints
│   │   └── logs.py                       # Activity logging
│   ├── services/
│   │   ├── csv_service.py                # CSV processing
│   │   ├── ml_service.py                 # ML inference
│   │   └── model_loader.py               # Model management
│   ├── modules/ml/
│   │   ├── services.py                   # ML business logic
│   │   ├── schemas.py                    # ML data schemas
│   │   └── model_registry.py             # Model registry
│   ├── db/
│   │   ├── database.py                   # Database connection
│   │   ├── supabase_client.py            # Supabase client
│   │   ├── init_db.py                    # Database initialization
│   │   └── seed.py                       # Data seeding
│   ├── models/                           # SQLAlchemy models
│   │   ├── dataset.py                    # Dataset model
│   │   └── log.py                        # Activity log model
│   └── schemas/                          # Pydantic schemas
│       ├── dataset.py                    # Dataset schemas
│       └── log.py                        # Log schemas
├── kepler/                               # Kepler ML models
│   ├── catboost_model.cbm
│   ├── xgboost_model.ubj
│   ├── lightgbm_model.txt
│   └── preprocessing_pipeline.pkl
└── tess/                                 # TESS ML models
    ├── catboost_model.cbm
    ├── xgboost_model.ubj
    ├── lightgbm_model.txt
    └── preprocessing_pipeline.pkl
```

**Key Design Patterns:**
- **Repository pattern** for data access
- **Service layer** for business logic
- **Dependency injection** with FastAPI
- **Singleton pattern** for model loader caching
- **Factory pattern** for model instantiation

### Data Flow

```
┌─────────────┐
│ User Upload │
│   CSV File  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 1. CSV Validation & Parsing              │
│    • Check file format                   │
│    • Validate required columns           │
│    • Detect dataset type (Kepler/TESS)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Feature Engineering                   │
│    • Load preprocessing pipeline         │
│    • Apply normalization/scaling         │
│    • Handle missing values               │
│    • Feature extraction                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Model Loading                         │
│    • Check model cache                   │
│    • Load ensemble models if needed      │
│    • Initialize model instances          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Ensemble Prediction                   │
│    • CatBoost prediction (40% weight)    │
│    • XGBoost prediction (35% weight)     │
│    • LightGBM prediction (25% weight)    │
│    • Soft voting aggregation             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Post-processing                       │
│    • Calculate confidence scores         │
│    • Generate class probabilities        │
│    • Create result metadata              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Response & Storage                    │
│    • Save to Supabase (optional)         │
│    • Log prediction activity             │
│    • Return JSON response                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. Frontend Visualization                │
│    • Display results in modal            │
│    • Show confidence distributions       │
│    • Enable CSV/JSON export              │
└─────────────────────────────────────────┘
```

---

## 📊 Features

### ✨ Core Features

- **🚀 ML-Powered Classification**
  - Upload CSV datasets from Kepler or TESS missions
  - Automatic dataset type detection
  - Ensemble model predictions with confidence scores
  - Support for batch predictions (1000+ rows)

- **🤖 AI Chatbot Assistant**
  - Powered by OpenAI GPT-3.5-Turbo
  - Expert guidance on exoplanet data analysis
  - Interactive Q&A about ML model predictions
  - Help with interpreting confidence scores and results
  - Context-aware responses based on your data

- **📈 Interactive Visualizations**
  - 3D exoplanet system visualization with Three.js
  - Real-time orbital animations
  - Class distribution charts
  - Confidence score heatmaps
  - Statistical analysis dashboards
  - Orbital period distributions
  - Discovery method breakdowns
  - Host star type analysis

- **💾 Data Management**
  - Secure file upload and validation
  - Prediction history tracking
  - Export results as CSV or JSON
  - Dataset metadata management
  - Cloud storage integration (Supabase)

- **🎨 Modern UI/UX**
  - Dark/light theme toggle
  - Responsive design for all devices
  - Full-page overlay modals
  - Smooth animations and transitions
  - Accessibility features
  - Intuitive dashboard navigation

- **⚡ Performance**
  - Model caching for fast predictions
  - Lazy loading of heavy components
  - Optimized API responses
  - CDN-ready static assets
  - Efficient data streaming

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Astro** | Static site generation & SSR | 5.14.1 |
| **React** | Interactive UI components | 18.3.1 |
| **TypeScript** | Type-safe development | 5.5.4 |
| **Tailwind CSS** | Utility-first styling | 3.4.10 |
| **Three.js** | 3D graphics rendering | 0.167.1 |
| **@react-three/fiber** | React renderer for Three.js | 8.18.0 |
| **@react-three/drei** | Three.js helpers & abstractions | 9.122.0 |
| **Plotly.js** | Interactive charts & visualizations | 2.34.0 |
| **React Plotly.js** | React wrapper for Plotly | 2.6.0 |
| **Supabase JS** | Database & auth client | 2.58.0 |
| **TensorFlow.js** | Client-side ML inference | 4.20.0 |
| **html2canvas** | Screenshot & export functionality | 1.4.1 |
| **ml-matrix** | Matrix operations for ML | 6.11.1 |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web framework & REST API | 0.115.0 |
| **Python** | Programming language | 3.11 |
| **Uvicorn** | ASGI server | 0.32.1 |
| **Pydantic** | Data validation & settings | 2.10.3 |
| **SQLAlchemy** | ORM for database | 2.0.36 |
| **Supabase** | PostgreSQL database & storage | 2.11.0 |
| **Storage3** | Supabase storage client | 0.8.2+ |
| **AsyncPG** | Async PostgreSQL driver | 0.30.0 |
| **Alembic** | Database migrations | 1.14.0 |
| **HTTPX** | Async HTTP client | 0.28.1 |
| **Python-Multipart** | File upload handling | 0.0.20 |

### **Machine Learning**
| Technology | Purpose | Version |
|------------|---------|---------|
| **TensorFlow** | Deep learning framework | 2.18.0 |
| **Keras** | High-level neural networks API | 3.8.0 |
| **Scikit-learn** | ML utilities & preprocessing | 1.6.1 |
| **CatBoost** | Gradient boosting (40% weight) | 1.2.7 |
| **XGBoost** | Gradient boosting (35% weight) | 2.1.3 |
| **LightGBM** | Gradient boosting (25% weight) | 4.5.0 |
| **Pandas** | Data manipulation | 2.2.3 |
| **NumPy** | Numerical computing | 1.26.0+ |
| **SciPy** | Scientific computing | 1.11.0+ |
| **Imbalanced-learn** | Handling imbalanced datasets | 0.11.0+ |

### **External APIs & Services**
| Service | Purpose | Cost |
|---------|---------|------|
| **OpenAI API (GPT-3.5-Turbo)** | AI chatbot assistant for exoplanet analysis | Paid (usage-based) |
| **NASA Exoplanet Archive** | Data source for Kepler & TESS datasets | Free |
| **Supabase** | PostgreSQL database & file storage | Free tier available |
| **Google Cloud Run** | Backend hosting & auto-scaling | Pay-per-use |

### **DevOps & Deployment**
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Google Cloud Run** | Production hosting |
| **Gunicorn** | Production WSGI server |
| **Mangum** | Serverless adapter |
| **Python-dotenv** | Environment variable management |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **npm** or **yarn**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/GRITX-AWA/GRIT-X-Awa.git
cd GRIT-X-Awa
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - for Supabase)
# Copy .env.example to .env and fill in your credentials

# Start the server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Backend will be available at:** `http://localhost:8000`
**API Documentation:** `http://localhost:8000/api/v1/docs`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file for OpenAI API (optional - for AI chatbot)
# Copy .env.example to .env
copy .env.example .env  # Windows
# cp .env.example .env   # macOS/Linux

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-api-key-here
# Get your key from: https://platform.openai.com/api-keys

# Start development server
npm run dev
```

**Frontend will be available at:** `http://localhost:4325`

> **Note:** The AI chatbot will not work without a valid OpenAI API key. All other features work without it.

### 4. Test the Application

1. Navigate to `http://localhost:4325`
2. Click on "Dashboard" or go to `http://localhost:4325/dashboard`
3. Upload a test file:
   - Use `test_kepler_sample.csv` for Kepler dataset
   - Use `test_tess_sample.csv` for TESS dataset
4. Click "Run ML Analysis"
5. View predictions with confidence scores!

---

## 📁 Project Structure

```
GRIT-X-AWA/
├── backend/                              # FastAPI Backend
│   ├── app/
│   │   ├── main.py                       # Application entry point
│   │   ├── api/v1/                       # API endpoints (v1)
│   │   │   ├── predict.py                # ML prediction routes
│   │   │   ├── upload.py                 # File upload routes
│   │   │   ├── analysis.py               # Data analysis routes
│   │   │   ├── predictions.py            # Prediction history
│   │   │   ├── models.py                 # Model management
│   │   │   ├── stats.py                  # Statistics
│   │   │   ├── logs.py                   # Activity logs
│   │   │   ├── train.py                  # Model training (future)
│   │   │   └── data.py                   # Data management
│   │   ├── services/                     # Business logic services
│   │   │   ├── csv_service.py            # CSV file processing
│   │   │   ├── ml_service.py             # ML inference logic
│   │   │   └── model_loader.py           # Model loading & caching
│   │   ├── modules/ml/                   # ML module
│   │   │   ├── services.py               # ML service layer
│   │   │   ├── schemas.py                # ML data schemas
│   │   │   └── model_registry.py         # Model registry
│   │   ├── db/                           # Database layer
│   │   │   ├── database.py               # SQLAlchemy setup
│   │   │   ├── supabase_client.py        # Supabase client
│   │   │   ├── init_db.py                # DB initialization
│   │   │   └── seed.py                   # Data seeding
│   │   ├── models/                       # SQLAlchemy models
│   │   │   ├── dataset.py                # Dataset model
│   │   │   └── log.py                    # Activity log model
│   │   ├── schemas/                      # Pydantic schemas
│   │   │   ├── dataset.py                # Dataset schemas
│   │   │   └── log.py                    # Log schemas
│   │   └── core/                         # Core utilities
│   │       └── config.py                 # Configuration
│   ├── kepler/                           # Kepler ML models
│   │   ├── catboost_model.cbm
│   │   ├── xgboost_model.ubj
│   │   ├── lightgbm_model.txt
│   │   └── preprocessing_pipeline.pkl
│   ├── tess/                             # TESS ML models
│   │   ├── catboost_model.cbm
│   │   ├── xgboost_model.ubj
│   │   ├── lightgbm_model.txt
│   │   └── preprocessing_pipeline.pkl
│   ├── requirements.txt                  # Python dependencies
│   ├── Dockerfile                        # Docker configuration
│   └── README.md                         # Backend documentation
│
├── frontend/                             # Astro + React Frontend
│   ├── src/
│   │   ├── components/                   # React components
│   │   │   ├── Hero.tsx                  # Landing hero section
│   │   │   ├── SpaceScene.tsx            # 3D space background
│   │   │   ├── DashboardLayoutComponent.tsx  # Dashboard layout
│   │   │   ├── PredictionResults.tsx     # Results modal
│   │   │   ├── ThemeToggle.tsx           # Dark/light mode
│   │   │   ├── ThemeContext.tsx          # Theme state
│   │   │   ├── sideBar.tsx               # Dashboard sidebar
│   │   │   ├── RecentActivity.tsx        # Recent activity widget
│   │   │   └── pages/                    # Page-level components
│   │   │       ├── Dashboard.tsx         # Dashboard home
│   │   │       ├── RunAnalysis.tsx       # ML analysis page
│   │   │       ├── Predictions.tsx       # Prediction history
│   │   │       ├── Visualizations.tsx    # Data visualizations
│   │   │       ├── Datasets.tsx          # Dataset management
│   │   │       ├── Exoplanets.tsx        # Exoplanet explorer
│   │   │       ├── Settings.tsx          # User settings
│   │   │       ├── HelpResources.tsx     # Help & docs
│   │   │       └── analysis/
│   │   │           ├── DataAnalysis.tsx  # Statistical analysis
│   │   │           └── ExoplanetVisualization3D.tsx  # 3D viz
│   │   ├── context/
│   │   │   └── SharedContext.tsx         # Global state
│   │   ├── services/
│   │   │   └── api.ts                    # API client
│   │   ├── pages/
│   │   │   ├── index.astro               # Landing page
│   │   │   └── dashboard.astro           # Dashboard entry
│   │   └── layouts/
│   │       └── Layout.astro              # Base layout
│   ├── public/                           # Static assets
│   ├── package.json                      # Node dependencies
│   ├── tsconfig.json                     # TypeScript config
│   ├── tailwind.config.mjs               # Tailwind config
│   ├── astro.config.mjs                  # Astro config
│   └── README.md                         # Frontend documentation
│
├── test_kepler_sample.csv                # Kepler test data
├── test_tess_sample.csv                  # TESS test data
├── .gitignore                            # Git ignore rules
├── LICENSE                               # MIT License
└── README.md                             # This file
```

---

## 🤖 ML Models

### Ensemble Architecture

The application uses a **weighted ensemble** approach combining three state-of-the-art gradient boosting algorithms:

| Model | Weight | Strengths |
|-------|--------|-----------|
| **CatBoost** | 40% | Excellent handling of categorical features, robust to overfitting |
| **XGBoost** | 35% | Fast performance, accurate predictions, regularization |
| **LightGBM** | 25% | Memory efficient, handles large datasets, leaf-wise growth |

**Ensemble Method:** Soft voting with weighted average of class probabilities

### Kepler Dataset

**Purpose:** Classify exoplanet candidates from NASA's Kepler mission

**Classes:**
- `CANDIDATE` - Potential exoplanet requiring further verification
- `CONFIRMED` - Verified exoplanet
- `FALSE POSITIVE` - Not an exoplanet (stellar phenomena, noise, etc.)

**Features:** 21 numerical features including:
- Orbital period, transit duration, depth
- Stellar parameters (temperature, radius, mass)
- Signal-to-noise ratio
- And more...

**Performance Metrics:**
- Accuracy: **95.2%**
- Precision: 94.8%
- Recall: 95.1%
- F1-Score: 94.9%

### TESS Dataset

**Purpose:** Classify exoplanet candidates from NASA's TESS mission

**Classes:**
- `APC` - Astrophysical False Positive Candidate
- `CP` - Confirmed Planet
- `FA` - False Alarm
- `FP` - False Positive
- `KP` - Known Planet
- `PC` - Planet Candidate

**Features:** 15 numerical features including:
- Transit parameters
- Stellar characteristics
- Light curve properties
- Signal quality metrics

**Performance Metrics:**
- Accuracy: **92.7%**
- Precision: 91.9%
- Recall: 92.4%
- F1-Score: 92.1%

### Model Training Pipeline

```python
# Simplified training pipeline
1. Data Collection
   └─> Load NASA exoplanet archive data

2. Preprocessing
   ├─> Handle missing values (median/mode imputation)
   ├─> Feature scaling (StandardScaler)
   ├─> Outlier detection (IQR method)
   └─> Train/test split (80/20)

3. Model Training
   ├─> CatBoost (1000 iterations, learning_rate=0.05)
   ├─> XGBoost (1000 iterations, learning_rate=0.05)
   └─> LightGBM (1000 iterations, learning_rate=0.05)

4. Hyperparameter Tuning
   └─> GridSearchCV with cross-validation

5. Ensemble Creation
   └─> Weighted soft voting (0.4, 0.35, 0.25)

6. Evaluation
   ├─> Confusion matrix
   ├─> ROC curves
   └─> Classification report

7. Serialization
   └─> Save models + preprocessing pipeline
```

---

## 📡 API Documentation

### Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://grit-x-awa-1035421252747.europe-west1.run.app`

### Key Endpoints

#### **Upload & Predict**

```http
POST /upload
Content-Type: multipart/form-data

Parameters:
  - file: CSV file (required)
  - dataset_type: "kepler" | "tess" | "auto" (optional, default: "auto")

Response: {
  "job_id": "uuid",
  "dataset_type": "kepler",
  "total_predictions": 100,
  "predictions": [
    {
      "row_index": 0,
      "predicted_class": "CONFIRMED",
      "confidence": {
        "CANDIDATE": 0.15,
        "CONFIRMED": 0.82,
        "FALSE POSITIVE": 0.03
      }
    }
  ]
}
```

#### **Get Available Models**

```http
GET /models

Response: {
  "models": [
    {
      "id": "kepler-ensemble",
      "name": "Kepler Ensemble",
      "dataset_type": "kepler",
      "classes": ["CANDIDATE", "CONFIRMED", "FALSE POSITIVE"],
      "accuracy": 95.2,
      "version": "1.0.0"
    }
  ]
}
```

#### **Get Prediction History**

```http
GET /predictions

Response: {
  "predictions": [
    {
      "id": "uuid",
      "dataset_type": "kepler",
      "created_at": "2025-01-15T10:30:00Z",
      "total_rows": 100,
      "accuracy": 95.2
    }
  ]
}
```

#### **Health Check**

```http
GET /stats/health

Response: {
  "status": "healthy",
  "database": "connected",
  "models_loaded": true,
  "version": "1.0.0"
}
```

### Interactive API Docs

- **Swagger UI:** `http://localhost:8000/api/v1/docs`
- **ReDoc:** `http://localhost:8000/api/v1/redoc`

---

## 🌐 External Resources & APIs

### Data Sources

#### **NASA Exoplanet Archive**
- **Purpose:** Primary source for Kepler and TESS exoplanet datasets
- **URL:** [https://exoplanetarchive.ipac.caltech.edu](https://exoplanetarchive.ipac.caltech.edu)
- **Cost:** Free (Public Domain)
- **Usage:** 
  - Kepler Cumulative Table: Training data for Kepler ML model
  - TESS TOI Catalog: Training data for TESS ML model
  - Regular updates with new discoveries

#### **OpenAI API (GPT-3.5-Turbo)**
- **Purpose:** Powers the AI chatbot assistant for intelligent data analysis help
- **URL:** [https://platform.openai.com](https://platform.openai.com)
- **Cost:** Pay-per-use (approximately $0.002 per 1K tokens for GPT-3.5-Turbo)
- **Features:**
  - Context-aware responses about exoplanet data
  - ML model interpretation assistance
  - Statistical analysis guidance
  - Educational content about exoplanets
- **Setup:**
  1. Create account at [OpenAI Platform](https://platform.openai.com)
  2. Generate API key from [API Keys page](https://platform.openai.com/api-keys)
  3. Add to `.env` file: `OPENAI_API_KEY=sk-your-key-here`
  4. Restart development server

### Cloud Services

#### **Supabase**
- **Purpose:** PostgreSQL database and file storage
- **URL:** [https://supabase.com](https://supabase.com)
- **Cost:** Free tier (500MB database, 1GB file storage)
- **Features:**
  - User authentication
  - Prediction history storage
  - CSV file uploads
  - Real-time data sync
- **Setup:**
  1. Create project at [Supabase Dashboard](https://app.supabase.com)
  2. Copy project URL and anon key
  3. Add to backend `.env`:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_KEY=your-anon-key
     ```

#### **Google Cloud Run**
- **Purpose:** Production backend hosting with auto-scaling
- **URL:** [https://cloud.google.com/run](https://cloud.google.com/run)
- **Cost:** Pay-per-use (free tier: 2 million requests/month)
- **Features:**
  - Automatic HTTPS
  - Container-based deployment
  - Auto-scaling (0 to N instances)
  - Built-in monitoring

### Required API Keys

| Service | Environment Variable | Required For | Free Tier |
|---------|---------------------|--------------|-----------|
| **OpenAI** | `OPENAI_API_KEY` | AI Chatbot | No (pay-per-use) |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_KEY` | Data persistence | Yes (500MB DB) |
| **NASA** | None | Dataset downloads | Yes (public) |

### Optional Services

These services enhance the platform but are not required for core functionality:

- **Vercel/Netlify** - Frontend hosting (free tier available)
- **Google Analytics** - Usage tracking (free)
- **Sentry** - Error monitoring (free tier available)

---

## 🚢 Deployment

### Production Deployment (Google Cloud Run)

The backend is deployed on **Google Cloud Run** with automatic scaling and HTTPS.

**Production URL:** `https://grit-x-awa-1035421252747.europe-west1.run.app`

#### Deploy to Google Cloud Run

```bash
# 1. Build Docker image
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/grit-x-awa .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/grit-x-awa

# 3. Deploy to Cloud Run
gcloud run deploy grit-x-awa \
  --image gcr.io/YOUR_PROJECT_ID/grit-x-awa \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

#### Environment Variables

**Backend (.env):**

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# Supabase Configuration (optional - for data persistence)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend-domain.com

# ML Models
ML_MODELS_DIR=./models
```

**Frontend (.env):**

```env
# OpenAI API Configuration (for AI Chatbot)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Backend API URL
VITE_API_URL=http://localhost:8000
```

> **Note:** The OpenAI API key is required for the AI chatbot feature. You can obtain an API key from [OpenAI Platform](https://platform.openai.com/api-keys). The chatbot provides intelligent assistance for exoplanet data analysis and ML model interpretation.

### Frontend Deployment

The frontend can be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)

**Build for production:**

```bash
cd frontend
npm run build
```

Output will be in `dist/` directory.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA** for providing open exoplanet data through the Exoplanet Archive
- **Kepler Space Telescope** mission team for revolutionary exoplanet discoveries
- **TESS (Transiting Exoplanet Survey Satellite)** mission team for ongoing surveys
- **OpenAI** for GPT-3.5-Turbo API powering the AI chatbot assistant
- **Supabase** for database and storage infrastructure
- **Google Cloud** for reliable hosting infrastructure
- **Open-source ML community** for amazing tools and frameworks:
  - TensorFlow, Scikit-learn, CatBoost, XGBoost, LightGBM
  - React, Astro, Three.js, Plotly
  - FastAPI, Uvicorn, SQLAlchemy

---

## � Authors

Meet the team behind GRIT-X-AWA:

- **[Cagla Nurcan Arslan](https://linkedin.com/in/cagla-nurcan-arslan-865861383)** - Team Lead & AI/ML Support
- **[Pablo Manjarres](https://linkedin.com/in/pablomanjarres)** - Full-Stack Developer & Technical Lead
- **[Sanawer Batool](https://linkedin.com/in/sanawer-batool)** - AI/ML Engineer
- **[Krish Patel](https://linkedin.com/in/krishpatel29)** - Backend Developer
- **[Yigit Faruk Demir](https://linkedin.com/in/yiğit-faruk-demir-68b95a25b)** - AI/ML Engineer
- **[Rishi Kalaiarasan](https://linkedin.com/in/rishi-kalaiarasan-90b591192)** - Backend Developer

---

## Contact

For questions, issues, or collaboration:

- **GitHub Issues:** [https://github.com/GRITX-AWA/GRIT-X-Awa/issues](https://github.com/GRITX-AWA/GRIT-X-Awa/issues)

---

## 📚 Additional Documentation

- **[RESOURCES.md](RESOURCES.md)** - Comprehensive guide to all external APIs, services, and resources
  - NASA Exoplanet Archive setup
  - OpenAI API configuration
  - Supabase database setup
  - Cost estimates and optimization tips
  - Security best practices

---

**Made with ❤️ by Team Grit-X Awa**
