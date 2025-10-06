# app/api/v1/cloud.py
from fastapi import APIRouter, HTTPException, Body
from app.services.cloud_run import call_health, call_predict

# Note: NO prefix here. We add the prefix in main.py.
router = APIRouter(tags=["cloud-run"])


@router.get("/health")
async def cloud_health():
    try:
        return await call_health()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cloud Run health check failed: {e}")


@router.post("/predict")
async def cloud_predict(
    body: dict = Body(..., description="Payload forwarded to Cloud Run /v1/predict"),
):
    try:
        return await call_predict(body)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cloud Run prediction failed: {e}")
