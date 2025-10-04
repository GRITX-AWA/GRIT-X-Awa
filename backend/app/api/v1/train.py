# app/api/v1/train.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.ml.services import train_model
from app.modules.ml.schemas import TrainRequest
from app.db.database import get_db

router = APIRouter()

# app/api/v1/train.py
@router.post("/")
async def train_endpoint(request: TrainRequest, db: AsyncSession = Depends(get_db)):
    result = await train_model(
        dataset_type=request.dataset_type,
        data=request.data,
        labels=request.labels,
        db=db
    )
    return result
