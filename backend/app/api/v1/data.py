# app/api/v1/data.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.dataset import SpaceData
from app.schemas.dataset import SpaceDataResponse, SpaceDataCreate

router = APIRouter(prefix="/api/v1/data", tags=["data"])

@router.get("/")
async def get_all_data(db: AsyncSession = Depends(get_db)):
    """Fetch all dataset entries"""
    try:
        # This would query your database for all space data
        # For now, returning a placeholder response
        return {
            "data": [],
            "total": 0,
            "message": "Dataset entries retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{data_id}")
async def get_data_by_id(data_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch dataset entry by ID"""
    try:
        # This would query your database for specific data entry
        # For now, returning a placeholder response
        return {
            "id": data_id,
            "kepid": data_id,
            "kepler_name": f"Kepler-{data_id}",
            "koi_disposition": "CONFIRMED",
            "koi_period": 365.25,
            "koi_prad": 1.0
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Data entry not found")

@router.post("/")
async def create_data_entry(data: SpaceDataCreate, db: AsyncSession = Depends(get_db)):
    """Add a new dataset entry"""
    try:
        # This would create a new entry in your database
        # For now, returning a placeholder response
        return {
            "id": 12345,
            "message": "Dataset entry created successfully",
            "data": data.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))