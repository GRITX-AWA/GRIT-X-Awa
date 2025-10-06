# backend/app/api/v1/schema.py
from fastapi import APIRouter
from app.modules.ml.feature_contract import RAW_ORDER, ENGINEERED_ORDER

router = APIRouter()

@router.get("/v1/schema/raw")
def schema_raw():
    """Return the 17 raw input column names."""
    return {"columns": RAW_ORDER, "count": len(RAW_ORDER)}

@router.get("/v1/schema/engineered")
def schema_engineered():
    """Return the 66 engineered feature column names."""
    return {"columns": ENGINEERED_ORDER, "count": len(ENGINEERED_ORDER)}
