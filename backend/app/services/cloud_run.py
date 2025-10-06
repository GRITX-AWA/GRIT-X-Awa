# app/services/cloud_run.py
from __future__ import annotations

import os
from typing import Any, Dict

import httpx
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.id_token import fetch_id_token
import google.auth  # Application Default Credentials

from app.core.config import settings


def _auth_header() -> Dict[str, str]:
    """
    Build the auth header depending on CLOUD_RUN_AUTH:
      - 'public'  -> no auth header
      - 'apikey'  -> x-api-key: <key>
      - 'idtoken' -> Authorization: Bearer <id_token> for the given audience
    """
    mode = (settings.cloud_run_auth or "public").strip().lower()

    if mode == "public":
        return {}

    if mode == "apikey":
        if not settings.cloud_run_api_key:
            raise RuntimeError("CLOUD_RUN_API_KEY is empty but CLOUD_RUN_AUTH=apikey")
        return {"x-api-key": settings.cloud_run_api_key}

    if mode == "idtoken":
        audience = settings.cloud_run_audience or settings.cloud_run_ml_service_url
        if not audience:
            raise RuntimeError("CLOUD_RUN_AUDIENCE or CLOUD_RUN_ML_SERVICE_URL must be set for idtoken auth")

        # Prefer explicit service account file if provided
        sa_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if sa_path and os.path.exists(sa_path):
            creds = service_account.Credentials.from_service_account_file(sa_path)
        else:
            # fallback to ADC (gcloud auth application-default login, etc.)
            creds, _ = google.auth.default()

        req = Request()
        token = fetch_id_token(req, audience, creds)
        return {"Authorization": f"Bearer {token}"}

    raise RuntimeError(f"Unsupported CLOUD_RUN_AUTH: {mode}")


def _base() -> str:
    base = (settings.cloud_run_ml_service_url or "").rstrip("/")
    if not base:
        raise RuntimeError("CLOUD_RUN_ML_SERVICE_URL is not configured")
    return base


async def call_health() -> Dict[str, Any]:
    """
    Optional endpoint; if your Cloud Run doesn’t expose /health this may return 404.
    """
    url = f"{_base()}/health"
    headers = _auth_header()
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, headers=headers)
        r.raise_for_status()
        try:
            return r.json()
        except Exception:
            return {"status": "ok", "body": r.text}


async def call_predict(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the Cloud Run model endpoint at /v1/predict.
    """
    url = f"{_base()}/v1/predict"
    headers = {"content-type": "application/json", **_auth_header()}
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=payload or {}, headers=headers)
        r.raise_for_status()
        return r.json()
