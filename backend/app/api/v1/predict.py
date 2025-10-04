# app/api/v1/predict.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.ml.services import predict_model
from app.modules.ml.schemas import PredictRequest
from app.db.database import get_db

router = APIRouter()

@router.post("/")
async def predict_endpoint(request: PredictRequest, db: AsyncSession = Depends(get_db)):
    result = await predict_model(request.dataset_type, request.data, db)
    return result
