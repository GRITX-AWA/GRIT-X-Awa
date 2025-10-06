# app/api/v1/predict.py
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Tuple, Literal
from pathlib import Path
import json
import numpy as np
import pandas as pd

from app.services.model_loader import get_model_loader

# Final path becomes /api/v1/predict (mounted from main.py with prefix=API_PREFIX)
router = APIRouter(prefix="/predict", tags=["Predict"])

# ---------- metadata helpers ----------
META_PATH = Path(__file__).resolve().parents[3] / "tess" / "trained_models" / "meta.json"
_meta_cache: Dict[str, Any] | None = None


def _load_meta() -> Dict[str, Any]:
    """Load cached meta.json (feature_order, class_names, weights)."""
    global _meta_cache
    if _meta_cache is None:
        try:
            with open(META_PATH, "r", encoding="utf-8") as f:
                _meta_cache = json.load(f)
        except Exception as e:
            raise HTTPException(500, f"Failed to read meta.json: {e}")
    return _meta_cache


def _get_models(ml) -> Tuple[Any, Any, Any]:
    """Fetch CatBoost, XGBoost, LightGBM models for TESS from the loader."""
    cat = getattr(ml, "tess_cat_model", None) or getattr(ml, "cat_model", None)
    xgb = getattr(ml, "tess_xgb_model", None) or getattr(ml, "xgb_model", None)
    lgb = getattr(ml, "tess_lgbm_model", None) or getattr(ml, "lgbm_model", None)
    if not (cat and xgb and lgb):
        raise HTTPException(500, "Missing one or more TESS base models (cat/xgb/lgbm).")
    return cat, xgb, lgb


def _get_imputer(ml):
    imp = getattr(ml, "tess_imputer", None) or getattr(ml, "imputer_tess", None) or getattr(ml, "imputer", None)
    if imp is None:
        raise HTTPException(500, "TESS imputer artifact not loaded.")
    return imp


def _get_target_encoder(ml):
    return getattr(ml, "tess_target_le", None) or getattr(ml, "target_le", None)


# ---------- request model ----------
class PredictRequest(BaseModel):
    dataset_type: Literal["tess", "kepler"] = Field(default="tess", description="Raw-mode currently supports 'tess'.")
    # Provide either 'rows' OR 'data'
    rows: Optional[List[Dict[str, Any]]] = Field(
        default=None, description="Array of objects with the 17 raw TESS columns."
    )
    data: Optional[List[List[float]]] = Field(
        default=None, description="Array of arrays (17 values) in the canonical raw order."
    )


@router.post("/", summary="Predict (raw mode, 17 raw TESS columns)")
def predict_raw(req: PredictRequest):
    # Only TESS raw-mode for now
    if req.dataset_type != "tess":
        raise HTTPException(400, "Raw-mode currently supports 'tess' only.")
    if (req.rows is None) and (req.data is None):
        raise HTTPException(400, "Provide either 'rows' or 'data' with the 17 raw columns.")

    # Load meta
    meta = _load_meta()
    feature_order: List[str] = meta.get("feature_order") or meta.get("features")
    if not feature_order or len(feature_order) != 17:
        raise HTTPException(500, "meta.json must expose 17-length 'feature_order' for raw mode.")

    weights = meta.get("weights") or [0.40, 0.35, 0.25]
    if len(weights) != 3:
        weights = [0.40, 0.35, 0.25]
    w_cat, w_xgb, w_lgb = [float(x) for x in weights]

    # Normalize input -> X_raw (17 columns in order)
    extras: List[str] = []
    if req.rows is not None:
        df_in = pd.DataFrame(req.rows)
        cols = set(df_in.columns)
        missing = [c for c in feature_order if c not in cols]
        if missing:
            raise HTTPException(400, {"ok": False, "error": "Missing required columns", "missing": missing})
        extras = sorted(list(cols - set(feature_order)))
        X_raw = df_in[feature_order].copy()
        used_input: Literal["rows", "data"] = "rows"
    else:
        bad = [i for i, row in enumerate(req.data or []) if len(row) != len(feature_order)]
        if bad:
            raise HTTPException(400, f"Row(s) with wrong length (expected {len(feature_order)}): {bad}")
        X_raw = pd.DataFrame(req.data, columns=feature_order)
        used_input = "data"

    # Preprocess (impute only; no feature engineering)
    ml = get_model_loader()
    imputer = _get_imputer(ml)
    try:
        X = pd.DataFrame(imputer.transform(X_raw), index=X_raw.index, columns=feature_order)
    except Exception as e:
        raise HTTPException(500, f"Preprocessing failed: {e}")

    # Base model predictions
    cat, xgb, lgb = _get_models(ml)

    def _proba_matrix(model, X_) -> np.ndarray:
        proba = model.predict_proba(X_)
        proba = np.asarray(proba, dtype=float)
        if proba.ndim == 1:
            proba = proba.reshape(-1, 1)
        return proba

    try:
        P_cat = _proba_matrix(cat, X)
        P_xgb = _proba_matrix(xgb, X)
        P_lgb = _proba_matrix(lgb, X)
    except Exception as e:
        raise HTTPException(500, f"Base model predict_proba failed: {e}")

    # Align classes in case models differ in class count
    n_classes = max(P_cat.shape[1], P_xgb.shape[1], P_lgb.shape[1])

    def _pad(P):
        if P.shape[1] == n_classes:
            return P
        Z = np.zeros((P.shape[0], n_classes), dtype=float)
        Z[:, :P.shape[1]] = P
        return Z

    P_cat, P_xgb, P_lgb = _pad(P_cat), _pad(P_xgb), _pad(P_lgb)

    # Weighted ensemble
    P = w_cat * P_cat + w_xgb * P_xgb + w_lgb * P_lgb
    pred_idx = P.argmax(axis=1)
    pred_prob = P[np.arange(P.shape[0]), pred_idx]

    # Map indices -> labels if encoder exists
    le = _get_target_encoder(ml)
    if le is not None and hasattr(le, "inverse_transform"):
        try:
            labels = [str(x) for x in le.inverse_transform(pred_idx)]
            class_names = [str(x) for x in getattr(le, "classes_", list(range(n_classes)))]
        except Exception:
            labels = [int(i) for i in pred_idx]
            class_names = [str(i) for i in range(n_classes)]
    else:
        labels = [int(i) for i in pred_idx]
        class_names = [str(i) for i in range(n_classes)]

    # Build response
    preds: List[Dict[str, Any]] = []
    for i in range(len(pred_idx)):
        preds.append(
            {
                "index": int(i),
                "percentage": round(float(pred_prob[i]) * 100.0, 2),
                "label": labels[i],
                "class_index": int(pred_idx[i]),
                "per_model": {
                    "cat": round(float(P_cat[i, :].max()) * 100.0, 2),
                    "xgb": round(float(P_xgb[i, :].max()) * 100.0, 2),
                    "lgbm": round(float(P_lgb[i, :].max()) * 100.0, 2),
                },
            }
        )

    model_version = getattr(ml, "tess_model_version", None) or getattr(ml, "model_version", "unknown")

    return {
        "ok": True,
        "count": len(preds),
        "predictions": preds,
        "weights": {"cat": w_cat, "xgb": w_xgb, "lgbm": w_lgb},
        "dropped_extra_cols": extras,
        "feature_order": feature_order,
        "class_names": class_names,
        "model_version": model_version,
        "used_input": used_input,
    }
