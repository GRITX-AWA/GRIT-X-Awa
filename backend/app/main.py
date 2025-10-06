# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum  # Serverless adapter for Vercel
from app.db.database import AsyncSessionLocal, Base, engine
from app.db.init_db import init_models
from app.db.seed import seed_models
from app.api.v1 import train, stats
from app.api.v1 import models, data, predictions
from app.api.v1 import analysis, upload, logs, exoplanets, classifications
from app.services.model_loader import get_model_loader

app = FastAPI(
    title="GRIT-X-Awa Exoplanet Analysis API",
    description="ML-powered exoplanet classification and analysis for TESS and Kepler missions",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    contact={
        "name": "GRIT-X-AWA",
        "url": "https://github.com/GRITX-AWA/GRIT-X-Awa",
    },
    license_info={
        "name": "MIT",
    }
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers (no legacy endpoints)
app.include_router(upload.router)  # Primary prediction endpoint: POST /api/v1/upload/csv
app.include_router(predictions.router)  # Get predictions: GET /api/v1/predictions/*
app.include_router(exoplanets.router)  # Analyzed exoplanets: GET /api/v1/exoplanets/*
app.include_router(classifications.router)  # Planet/star classification: POST /api/v1/classifications/*
app.include_router(analysis.router)  # Analysis endpoints
app.include_router(models.router)  # Model management
app.include_router(data.router)  # Data management
app.include_router(logs.router)  # Upload logs
app.include_router(train.router, prefix="/train", tags=["Train"])  # Model training (future)
app.include_router(stats.router, prefix="/stats", tags=["Stats"])  # Statistics (future)


@app.get("/", tags=["Root"])
async def root():
    """
    API Root - Redirects to documentation
    
    Welcome to the GRIT-X-Awa Exoplanet Analysis API!
    
    **Main Endpoints:**
    - `POST /api/v1/upload/csv` - Upload CSV file for exoplanet prediction
    - `GET /api/v1/predictions/job/{job_id}` - Get predictions by job ID
    - `GET /api/v1/exoplanets` - Get analyzed exoplanets
    - `POST /api/v1/classifications/analyze` - Analyze planet habitability
    
    **Documentation:**
    - Interactive API Docs: `/api/v1/docs`
    - ReDoc: `/api/v1/redoc`
    """
    return {
        "message": "GRIT-X-Awa Exoplanet Analysis API",
        "version": "1.0.0",
        "status": "online",
        "documentation": {
            "swagger_ui": "/api/v1/docs",
            "redoc": "/api/v1/redoc"
        },
        "endpoints": {
            "upload_and_predict": "POST /api/v1/upload/csv",
            "get_predictions": "GET /api/v1/predictions/job/{job_id}",
            "get_exoplanets": "GET /api/v1/exoplanets",
            "classify_planet": "POST /api/v1/classifications/analyze"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    """
    return {
        "status": "healthy",
        "service": "GRIT-X-Awa API",
        "version": "1.0.0"
    }


@app.on_event("startup")
async def startup_event():
    # Initialize database tables (skip if connection fails for local dev)
    try:
        await init_models()
        print("✅ Database initialized and tables created successfully!")

        # Seed initial models
        async with AsyncSessionLocal() as db:
            await seed_models(db)
            print("✅ Seeded initial models successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Failed to connect to database: {str(e)}")
        print("   Running in LOCAL MODE without database persistence.")
        print("   File uploads and predictions will work, but won't be saved to Supabase.")

    # Preload ML models into cache
    try:
        model_loader = get_model_loader()
        model_loader.preload_all_models()
        print("✅ ML models (Kepler & TESS) preloaded successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Failed to preload ML models: {str(e)}")
        print("   Models will be loaded on first request instead.")


# Serverless handler for Vercel deployment
handler = Mangum(app, lifespan="off")
