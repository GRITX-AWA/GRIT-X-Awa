from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ExoplanetBase(BaseModel):
    """Base schema for exoplanet data"""
    dataset_type: str
    predicted_class: str
    confidence_score: Optional[float] = None

    # Common fields
    ra: Optional[float] = None
    dec: Optional[float] = None


class ExoplanetCreate(ExoplanetBase):
    """Schema for creating a new analyzed exoplanet"""
    job_id: str
    row_index: int

    # All feature fields as optional (depends on dataset type)
    kepid: Optional[int] = None
    kepler_name: Optional[str] = None
    koi_disposition: Optional[str] = None
    koi_pdisposition: Optional[str] = None
    koi_score: Optional[float] = None
    koi_fpflag_nt: Optional[float] = None
    koi_fpflag_ss: Optional[float] = None
    koi_fpflag_co: Optional[float] = None
    koi_fpflag_ec: Optional[float] = None
    koi_period: Optional[float] = None
    koi_impact: Optional[float] = None
    koi_duration: Optional[float] = None
    koi_depth: Optional[float] = None
    koi_prad: Optional[float] = None
    koi_teq: Optional[float] = None
    koi_insol: Optional[float] = None
    koi_model_snr: Optional[float] = None
    koi_tce_plnt_num: Optional[float] = None
    koi_steff: Optional[float] = None
    koi_slogg: Optional[float] = None
    koi_srad: Optional[float] = None
    koi_kepmag: Optional[float] = None

    # TESS features
    toi: Optional[float] = None
    tid: Optional[int] = None
    tfopwg_disp: Optional[str] = None
    rastr: Optional[str] = None
    decstr: Optional[str] = None
    pl_orbper: Optional[float] = None
    pl_rade: Optional[float] = None
    pl_trandep: Optional[float] = None
    pl_trandurh: Optional[float] = None
    pl_eqt: Optional[float] = None
    pl_insol: Optional[float] = None
    st_rad: Optional[float] = None
    st_teff: Optional[float] = None
    st_logg: Optional[float] = None
    st_dist: Optional[float] = None
    st_pmra: Optional[float] = None
    st_pmdec: Optional[float] = None
    st_tmag: Optional[float] = None
    toi_created: Optional[str] = None
    rowupdate: Optional[str] = None


class ExoplanetResponse(ExoplanetCreate):
    """Schema for exoplanet response"""
    id: int
    validated: bool = False
    validation_status: Optional[str] = None
    matched_with_id: Optional[int] = None
    stored_in_bucket: bool = False
    bucket_path: Optional[str] = None
    created_at: datetime
    validated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExoplanetValidationResult(BaseModel):
    """Result of validation process"""
    id: int
    validation_status: str
    matched_with_id: Optional[int] = None
    is_new_discovery: bool
    confidence_match: Optional[float] = None
    notes: Optional[str] = None


class BulkExoplanetCreate(BaseModel):
    """Schema for creating multiple analyzed exoplanets"""
    job_id: str
    dataset_type: str
    predictions: list[Dict[str, Any]]
    original_data: list[Dict[str, Any]]
