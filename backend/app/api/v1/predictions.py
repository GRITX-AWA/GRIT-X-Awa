# app/api/v1/predictions.py
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.ml_service import MLService
from app.db import supabase_client as sb
from app.modules.ml.schemas import PredictionJobResponse
from typing import Optional

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])

@router.post("/")
async def make_prediction(prediction_data: dict, db: AsyncSession = Depends(get_db)):
    """Call ML API to get prediction for input data"""
    try:
        ml_service = MLService()
        result = await ml_service.predict(prediction_data)
        return {
            "prediction": result,
            "confidence": 0.85,
            "model_used": "kepler_transit_detection",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/status")
async def get_prediction_status():
    """Get status of available ML models"""
    return {
        "ml_service_status": "online",
        "available_models": [
            {
                "name": "kepler_transit_detection",
                "status": "active",
                "accuracy": 0.87
            },
            {
                "name": "exoplanet_classification",
                "status": "active",
                "accuracy": 0.82
            }
        ],
        "last_updated": "2025-10-02T00:00:00Z"
    }

@router.get("/job/{job_id}")
async def get_predictions_by_job_id(job_id: str):
    """
    Retrieve all predictions for a specific job ID

    Args:
        job_id: Unique identifier for the upload/prediction job

    Returns:
        All predictions associated with the job
    """
    try:
        result = sb.get_predictions_by_job(job_id)

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"No predictions found for job_id: {job_id}")

        # Extract metadata from first record
        first_record = result.data[0]
        dataset_type = first_record.get("dataset_type", "unknown")
        created_at = first_record.get("created_at")

        return {
            "job_id": job_id,
            "dataset_type": dataset_type,
            "created_at": created_at,
            "total_predictions": len(result.data),
            "predictions": result.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve predictions: {str(e)}")

@router.get("/recent")
async def get_recent_predictions_endpoint(limit: int = Query(50, ge=1, le=200)):
    """
    Get recent predictions across all jobs

    Args:
        limit: Maximum number of predictions to return (1-200, default 50)

    Returns:
        List of recent predictions ordered by creation time
    """
    try:
        result = sb.get_recent_predictions(limit=limit)

        return {
            "total": len(result.data),
            "limit": limit,
            "predictions": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recent predictions: {str(e)}")