# app/services/csv_service.py
import pandas as pd
import numpy as np
from io import BytesIO
from typing import Tuple, Dict, Any
from app.services.model_loader import get_model_loader


class CSVProcessor:
    """
    Processes uploaded CSV files for exoplanet prediction.
    Detects dataset type, validates features, and preprocesses data.
    """

    # Expected column sets for each dataset type
    KEPLER_FEATURES = {
        'koi_pdisposition', 'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss',
        'koi_fpflag_co', 'koi_fpflag_ec', 'koi_period', 'koi_impact',
        'koi_duration', 'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol',
        'koi_model_snr', 'koi_tce_plnt_num', 'koi_steff', 'koi_slogg',
        'koi_srad', 'ra', 'dec', 'koi_kepmag'
    }

    TESS_FEATURES = {
        'ra', 'dec', 'st_teff', 'st_logg', 'st_rad', 'st_dist',
        'st_pmra', 'st_pmdec', 'st_tmag', 'pl_orbper', 'pl_rade',
        'pl_trandep', 'pl_trandurh', 'pl_eqt', 'pl_insol'
    }

    def __init__(self):
        self.model_loader = get_model_loader()

    def detect_dataset_type(self, df: pd.DataFrame) -> str:
        """
        Auto-detect dataset type (Kepler or TESS) based on column names

        Args:
            df: Input DataFrame

        Returns:
            'kepler' or 'tess'

        Raises:
            ValueError: If dataset type cannot be determined
        """
        columns = set(df.columns)

        kepler_match = len(columns & self.KEPLER_FEATURES)
        tess_match = len(columns & self.TESS_FEATURES)

        if kepler_match > tess_match and kepler_match >= 10:
            return 'kepler'
        elif tess_match > kepler_match and tess_match >= 10:
            return 'tess'
        else:
            raise ValueError(
                f"Cannot determine dataset type. "
                f"Kepler features found: {kepler_match}, TESS features found: {tess_match}. "
                f"Need at least 10 matching features."
            )

    def parse_csv(self, file_bytes: bytes) -> pd.DataFrame:
        """
        Parse CSV file from bytes

        Args:
            file_bytes: CSV file content as bytes

        Returns:
            pandas DataFrame
        """
        return pd.read_csv(BytesIO(file_bytes), comment='#')

    def preprocess_kepler(self, df: pd.DataFrame) -> np.ndarray:
        """
        Preprocess Kepler dataset using trained imputer and encoders

        Args:
            df: Raw DataFrame with Kepler features

        Returns:
            Preprocessed feature array ready for prediction
        """
        models = self.model_loader.get_kepler_models()
        metadata = models['metadata']
        feature_order = metadata['feature_order']

        # Ensure we have all required features
        missing_features = set(feature_order) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Select and order features according to training
        df_ordered = df[feature_order].copy()

        # Handle categorical encoding (koi_pdisposition if present)
        encoders = models['encoders']
        if isinstance(encoders, dict):
            for col, encoder in encoders.items():
                if col in df_ordered.columns:
                    df_ordered[col] = encoder.transform(df_ordered[col])
        else:
            # If encoders is a single LabelEncoder for koi_pdisposition
            if 'koi_pdisposition' in df_ordered.columns:
                df_ordered['koi_pdisposition'] = encoders.transform(df_ordered['koi_pdisposition'])

        # Impute missing values
        imputer = models['imputer']
        X_imputed = imputer.transform(df_ordered.values)

        return X_imputed

    def preprocess_tess(self, df: pd.DataFrame) -> np.ndarray:
        """
        Preprocess TESS dataset using trained imputer and encoders

        Args:
            df: Raw DataFrame with TESS features

        Returns:
            Preprocessed feature array ready for prediction
        """
        models = self.model_loader.get_tess_models()
        metadata = models['metadata']
        feature_order = metadata['feature_order']

        # Ensure we have all required features
        missing_features = set(feature_order) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Select and order features according to training
        df_ordered = df[feature_order].copy()

        # Handle categorical encoding if present
        encoders = models['encoders']
        if isinstance(encoders, dict):
            for col, encoder in encoders.items():
                if col in df_ordered.columns:
                    df_ordered[col] = encoder.transform(df_ordered[col])

        # Impute missing values
        imputer = models['imputer']
        X_imputed = imputer.transform(df_ordered.values)

        return X_imputed

    def process_csv_file(self, file_bytes: bytes) -> Tuple[str, np.ndarray, pd.DataFrame]:
        """
        Complete CSV processing pipeline

        Args:
            file_bytes: CSV file content as bytes

        Returns:
            Tuple of (dataset_type, preprocessed_features, original_dataframe)
        """
        # Parse CSV
        df = self.parse_csv(file_bytes)

        # Detect dataset type
        dataset_type = self.detect_dataset_type(df)

        # Preprocess based on type
        if dataset_type == 'kepler':
            features = self.preprocess_kepler(df)
        else:  # tess
            features = self.preprocess_tess(df)

        return dataset_type, features, df


# Global instance
_csv_processor = CSVProcessor()

def get_csv_processor() -> CSVProcessor:
    """Get the global CSV processor instance"""
    return _csv_processor
