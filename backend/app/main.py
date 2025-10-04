# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import AsyncSessionLocal, Base, engine
from app.db.init_db import init_models
from app.db.seed import seed_models
from app.api.v1 import predict, train, stats
from app.api.v1 import models, data, predictions
from app.api.v1 import analysis, upload, logs
from app.services.model_loader import get_model_loader

app = FastAPI(
    title="Space ML Explorer Backend",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from both branches
app.include_router(predict.router, prefix="/predict", tags=["Predict"])
app.include_router(train.router, prefix="/train", tags=["Train"])
app.include_router(stats.router, prefix="/stats", tags=["Stats"])
app.include_router(models.router)
app.include_router(data.router)
app.include_router(predictions.router)
app.include_router(analysis.router)
app.include_router(upload.router)  # New upload router
app.include_router(logs.router)  # Logs router


@app.on_event("startup")
async def startup_event():
    # Initialize database tables
    await init_models()
    print("✅ Database initialized and tables created successfully!")

    # Seed initial models
    async with AsyncSessionLocal() as db:
        await seed_models(db)
        print("✅ Seeded initial models successfully!")

    # Preload ML models into cache
    try:
        model_loader = get_model_loader()
        model_loader.preload_all_models()
        print("✅ ML models (Kepler & TESS) preloaded successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Failed to preload ML models: {str(e)}")
        print("   Models will be loaded on first request instead.")
