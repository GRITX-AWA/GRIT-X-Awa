from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import data, predictions, train, models, analysis, stats, upload, predict

app = FastAPI(
    title="Exoplanet Explorer API",
    description="API for exoplanet data analysis and ML predictions",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://127.0.0.1:4321"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data.router, prefix="/api/v1/data", tags=["data"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(predict.router, prefix="/api/v1/predict", tags=["predict"])
app.include_router(train.router, prefix="/api/v1/train", tags=["train"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])

@app.get("/")
async def root():
    return {"message": "Exoplanet Explorer API", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}