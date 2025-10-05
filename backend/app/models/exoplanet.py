from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.db.database import Base


class AnalyzedExoplanet(Base):
    """
    Stores exoplanets that have been analyzed through the prediction system
    """
    __tablename__ = 'analyzed_exoplanets'

    id = Column(Integer, primary_key=True, index=True)

    # Identification
    job_id = Column(String, index=True, nullable=False)
    row_index = Column(Integer, nullable=False)
    dataset_type = Column(String, nullable=False)  # 'kepler' or 'tess'

    # Prediction results
    predicted_class = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)

    # Kepler features (nullable for TESS)
    kepid = Column(Integer, nullable=True)
    kepler_name = Column(String, nullable=True)
    koi_disposition = Column(String, nullable=True)
    koi_pdisposition = Column(String, nullable=True)
    koi_score = Column(Float, nullable=True)
    koi_fpflag_nt = Column(Float, nullable=True)
    koi_fpflag_ss = Column(Float, nullable=True)
    koi_fpflag_co = Column(Float, nullable=True)
    koi_fpflag_ec = Column(Float, nullable=True)
    koi_period = Column(Float, nullable=True)
    koi_impact = Column(Float, nullable=True)
    koi_duration = Column(Float, nullable=True)
    koi_depth = Column(Float, nullable=True)
    koi_prad = Column(Float, nullable=True)
    koi_teq = Column(Float, nullable=True)
    koi_insol = Column(Float, nullable=True)
    koi_model_snr = Column(Float, nullable=True)
    koi_tce_plnt_num = Column(Float, nullable=True)
    koi_steff = Column(Float, nullable=True)
    koi_slogg = Column(Float, nullable=True)
    koi_srad = Column(Float, nullable=True)
    koi_kepmag = Column(Float, nullable=True)

    # TESS features (nullable for Kepler)
    toi = Column(Float, nullable=True)
    tid = Column(Integer, nullable=True)
    tfopwg_disp = Column(String, nullable=True)
    rastr = Column(String, nullable=True)
    decstr = Column(String, nullable=True)
    pl_orbper = Column(Float, nullable=True)
    pl_rade = Column(Float, nullable=True)
    pl_trandep = Column(Float, nullable=True)
    pl_trandurh = Column(Float, nullable=True)
    pl_eqt = Column(Float, nullable=True)
    pl_insol = Column(Float, nullable=True)
    st_rad = Column(Float, nullable=True)
    st_teff = Column(Float, nullable=True)
    st_logg = Column(Float, nullable=True)
    st_dist = Column(Float, nullable=True)
    st_pmra = Column(Float, nullable=True)
    st_pmdec = Column(Float, nullable=True)
    st_tmag = Column(Float, nullable=True)
    toi_created = Column(String, nullable=True)
    rowupdate = Column(String, nullable=True)

    # Common fields
    ra = Column(Float, nullable=True)
    dec = Column(Float, nullable=True)

    # Validation status
    validated = Column(Boolean, default=False)
    validation_status = Column(String, nullable=True)  # 'pending', 'matched', 'new_discovery', 'error'
    matched_with_id = Column(Integer, nullable=True)  # Reference to original dataset if matched

    # Storage location
    stored_in_bucket = Column(Boolean, default=False)
    bucket_path = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)

    def __repr__(self):
        name = self.kepler_name or self.toi or f"{self.dataset_type}_{self.id}"
        return f"<AnalyzedExoplanet {name} ({self.predicted_class})>"
