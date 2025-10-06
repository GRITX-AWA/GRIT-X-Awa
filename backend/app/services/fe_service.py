# backend/app/services/fe_service.py
from __future__ import annotations
import pandas as pd
import numpy as np

from app.modules.feature_contract import RAW_ORDER, ENGINEERED_ORDER

# If your existing FE lives here, we'll use it when available:
try:
    from app.services.tess_feature_engineering import build_features as _build_features_impl  # type: ignore
except Exception:
    _build_features_impl = None

CRITICAL_RAW = ["pl_orbper","pl_trandep","pl_trandur","st_tmag"]
ROW_MISSING_CAP = 0.40  # reject a row if >40% engineered values are NaN

def normalize_raw(df: pd.DataFrame):
    cols = set(df.columns)
    req = set(RAW_ORDER)
    missing = [c for c in RAW_ORDER if c not in cols]
    if missing:
        raise ValueError(f"Missing required raw columns: {missing}")
    extras = sorted(list(cols - req))
    return df[RAW_ORDER].copy(), extras

def row_missing_criticals(raw_row: pd.Series):
    return [c for c in CRITICAL_RAW if pd.isna(raw_row.get(c))]

def engineered_missing_pct(fe_row: pd.Series) -> float:
    return float(fe_row.isna().mean())

def build_features(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Deterministic training-aligned FE: 17 raw -> 66 engineered.
    Uses your existing tess_feature_engineering.build_features if present,
    otherwise falls back to a no-op skeleton you can extend.
    """
    if _build_features_impl is not None:
        fe = _build_features_impl(df_raw).copy()
    else:
        # --- stub: replace with your real formulas if not using the impl above ---
        df = df_raw.copy()
        fe = pd.DataFrame(index=df.index)
        # fe["pl_orbper_log"] = np.log1p(df["pl_orbper"])
        # fe["transit_depth_normalized"] = df["pl_trandep"]
        # fe["transit_duration_fraction"] = df["pl_trandur"] / (df["pl_orbper"] * 24.0)

    # Enforce final engineered schema (pad with NaN; imputer will fill)
    fe = fe.reindex(columns=ENGINEERED_ORDER, fill_value=np.nan)
    if list(fe.columns) != ENGINEERED_ORDER:
        raise RuntimeError("ENGINEERED_ORDER mismatch with FE output.")
    return fe
