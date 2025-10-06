# app/services/cloud_client.py
from __future__ import annotations

import json
from typing import Any, Dict, Optional

import requests
from google.oauth2 import id_token
from google.auth.transport.requests import Request

from app.core.config import settings


def _bearer_id_token(audience: str) -> str:
    # Uses ADC (GOOGLE_APPLICATION_CREDENTIALS or gcloud login)
    tok = id_token.fetch_id_token(Request(), audience)
    return f"Bearer {tok}"


def _build_headers() -> Dict[str, str]:
    headers: Dict[str, str] = {"Content-Type": "application/json"}

    auth = str(settings.cloud_run_auth).lower()
    if auth == "idtoken":
        headers["Authorization"] = _bearer_id_token(settings.cloud_run_audience)
    elif auth == "apikey" and settings.cloud_run_api_key:
        headers["x-api-key"] = settings.cloud_run_api_key
    # if auth == "public": no extra header

    return headers


def _join(base: str, path: str) -> str:
    base = base.rstrip("/")
    if not path.startswith("/"):
        path = "/" + path
    return base + path


def cloud_get(path: str, timeout: float = 20.0) -> requests.Response:
    url = _join(settings.cloud_run_url, path)
    headers = _build_headers()
    resp = requests.get(url, headers=headers, timeout=timeout)
    return resp


def cloud_post(path: str, payload: Dict[str, Any] | None = None, timeout: float = 30.0) -> requests.Response:
    url = _join(settings.cloud_run_url, path)
    headers = _build_headers()
    data = json.dumps(payload or {})
    resp = requests.post(url, headers=headers, data=data, timeout=timeout)
    return resp
