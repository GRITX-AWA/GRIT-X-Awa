# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import AsyncSessionLocal
from app.db.init_db import init_models
from app.db.seed import seed_models

from app.api.v1 import predict, train, stats
from app.api.v1 import models, data, predictions, analysis, upload
from app.api.v1 import schema as schema_api  # optional schema endpoints
from app.api.v1.cloud import router as cloud_router  # Cloud Run routes

from app.services.model_loader import get_model_loader

# ---- API base prefix (everything mounts under this) ----
API_PREFIX = "/api/v1"

app = FastAPI(
    title="Space ML Explorer Backend",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers (all under /api/v1) ----
# NOTE: predict.router already has prefix="/predict" inside, so the final paths are /api/v1/predict/...
app.include_router(predict.router,     prefix=API_PREFIX)
app.include_router(train.router,       prefix=API_PREFIX)
app.include_router(stats.router,       prefix=API_PREFIX)
app.include_router(models.router,      prefix=API_PREFIX)
app.include_router(data.router,        prefix=API_PREFIX)
app.include_router(predictions.router, prefix=API_PREFIX)
app.include_router(analysis.router,    prefix=API_PREFIX)
app.include_router(upload.router,      prefix=API_PREFIX)
app.include_router(schema_api.router,  prefix=API_PREFIX)

# Cloud Run extras remain namespaced
app.include_router(cloud_router, prefix=f"{API_PREFIX}/cloud", tags=["cloud-run"])

# ---- Health & debug (optional) ----
@app.get("/healthz", tags=["health"])
def healthz():
    return {"ok": True}

@app.get("/__debug_routes")
def __debug_routes():
    return [getattr(r, "path", str(r)) for r in app.router.routes]

# ---- Startup t
