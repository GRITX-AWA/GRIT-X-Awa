# app/api/v1/models.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.modules.ml.services import get_available_models

router = APIRouter(prefix="/api/v1/models", tags=["models"])

@router.get("/")
async def get_models(db: AsyncSession = Depends(get_db)):
    """Get all available ML models"""
    try:
        models = await get_available_models(db)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{model_id}")
async def get_model_by_id(model_id: str, db: AsyncSession = Depends(get_db)):
    """Get specific model by ID"""
    try:
        # This would fetch a specific model from your database
        # For now, returning a placeholder response
        return {
            "model_id": model_id,
            "name": f"Model {model_id}",
            "status": "active",
            "accuracy": 0.85
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_models_status():
    """Get status of available ML models"""
    return {
        "status": "online",
        "available_models": ["kepler_transit_detection", "exoplanet_classification"],
        "total_models": 2
    }