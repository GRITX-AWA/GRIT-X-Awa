# app/api/v1/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.ml.services import get_model_stats
from app.db.database import get_db

router = APIRouter()

@router.get("/")
async def stats_endpoint(db: AsyncSession = Depends(get_db)):
    stats = await get_model_stats(db)
    return {"models": stats}
