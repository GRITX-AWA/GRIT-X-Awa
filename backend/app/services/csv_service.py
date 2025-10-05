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
                    try:
                        df_ordered[col] = encoder.transform(df_ordered[col])
                    except ValueError as e:
                        # Get known classes
                        known_classes = encoder.classes_ if hasattr(encoder, 'classes_') else []
                        unknown_values = set(df_ordered[col].unique()) - set(known_classes)
                        raise ValueError(
                            f"Column '{col}' contains unknown values: {unknown_values}. "
                            f"Expected one of: {list(known_classes)}"
                        )
        else:
            # If encoders is a single LabelEncoder for koi_pdisposition
            if 'koi_pdisposition' in df_ordered.columns:
                try:
                    df_ordered['koi_pdisposition'] = encoders.transform(df_ordered['koi_pdisposition'])
                except ValueError as e:
                    # Get known classes
                    known_classes = encoders.classes_ if hasattr(encoders, 'classes_') else []
                    unknown_values = set(df_ordered['koi_pdisposition'].unique()) - set(known_classes)
                    raise ValueError(
                        f"Column 'koi_pdisposition' contains unknown values: {unknown_values}. "
                        f"Expected one of: {list(known_classes)}"
                    )

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
                    try:
                        df_ordered[col] = encoder.transform(df_ordered[col])
                    except ValueError as e:
                        # Get known classes
                        known_classes = encoder.classes_ if hasattr(encoder, 'classes_') else []
                        unknown_values = set(df_ordered[col].unique()) - set(known_classes)
                        raise ValueError(
                            f"Column '{col}' contains unknown values: {unknown_values}. "
                            f"Expected one of: {list(known_classes)}"
                        )

        # Impute missing values
        imputer = models['imputer']
        X_imputed = imputer.transform(df_ordered.values)

        return X_imputed

    def polish_csv(self, df: pd.DataFrame, dataset_type: str = None) -> pd.DataFrame:
        """
        Remove unused columns from CSV, keeping only features used by the model

        Args:
            df: Input DataFrame
            dataset_type: 'kepler' or 'tess'. If None, auto-detects.

        Returns:
            DataFrame with only model-relevant columns
        """
        # Auto-detect if not specified
        if dataset_type is None:
            dataset_type = self.detect_dataset_type(df)

        # Get the feature order from model metadata
        models = self.model_loader.get_kepler_models() if dataset_type == 'kepler' else self.model_loader.get_tess_models()
        required_features = models['metadata']['feature_order']

        # Find which required features are present in the dataframe
        available_features = [col for col in required_features if col in df.columns]

        # Return only the available model features in the correct order
        return df[available_features].copy()

    def polish_csv_bytes(self, file_bytes: bytes, dataset_type: str = None) -> bytes:
        """
        Polish CSV file bytes by removing unused columns

        Args:
            file_bytes: CSV file content as bytes
            dataset_type: 'kepler' or 'tess'. If None, auto-detects.

        Returns:
            Polished CSV as bytes
        """
        # Parse CSV
        df = self.parse_csv(file_bytes)

        # Polish the dataframe
        polished_df = self.polish_csv(df, dataset_type)

        # Convert back to CSV bytes
        buffer = BytesIO()
        polished_df.to_csv(buffer, index=False)
        return buffer.getvalue()

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
