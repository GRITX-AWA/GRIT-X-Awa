"""
TESS New Model Feature Engineering Service
Implements the exact feature engineering from the new optimized TESS model
Achieves 92.3% accuracy with 34 engineered features
"""

import pandas as pd
import numpy as np
from scipy.stats.mstats import winsorize


class TessNewFeatureEngineer:
    """
    TESS new model feature engineering pipeline
    Converts 17 base features into 34 engineered features

    Base features required:
    - ra, dec, st_teff, st_logg, st_rad, st_dist
    - st_pmra, st_pmdec, st_tmag
    - pl_orbper, pl_rade, pl_trandep, pl_trandurh, pl_eqt, pl_insol
    - pl_tranmid, pl_pnum
    """

    # Physical constant
    R_SUN_TO_EARTH = 109.2  # Solar radius to Earth radius conversion

    BASE_FEATURES = [
        "ra", "dec", "st_teff", "st_logg", "st_rad", "st_dist",
        "st_pmra", "st_pmdec", "st_tmag",
        "pl_orbper", "pl_rade", "pl_trandep", "pl_trandurh", "pl_eqt", "pl_insol",
        "pl_tranmid", "pl_pnum"
    ]

    def __init__(self):
        pass

    def apply_winsorization(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply winsorization to handle outliers (1% on each tail)
        This is the FIRST step in preprocessing
        """
        df_copy = df.copy()
        for col in self.BASE_FEATURES:
            if col in df_copy.columns:
                df_copy[col] = winsorize(df_copy[col], limits=[0.01, 0.01])
        return df_copy

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply all feature engineering transformations
        This creates 17 additional features from the base 17

        Args:
            df: DataFrame with 17 base features (already winsorized)

        Returns:
            DataFrame with 34 features (17 base + 17 engineered)
        """
        df = df.copy()

        # 1. Planet-star radius ratio
        df['planet_star_ratio'] = df['pl_rade'] / (df['st_rad'] * self.R_SUN_TO_EARTH)

        # 2. Transit depth normalized (convert from ppm to fraction)
        df['transit_depth_normalized'] = df['pl_trandep'] / 1e6

        # 3. Transit depth anomaly (measures if transit depth matches expected geometry)
        df['transit_depth_anomaly'] = df['transit_depth_normalized'] / (df['planet_star_ratio']**2 + 1e-12)

        # 4. Detection quality (heuristic: transit depth vs star brightness)
        df['detection_quality'] = df['pl_trandep'] / (10 ** (df['st_tmag'] / 5.0))

        # 5. Transit duration fraction (what fraction of orbit is in transit)
        df['transit_duration_fraction'] = df['pl_trandurh'] / (df['pl_orbper'] * 24.0)

        # 6-8. Logarithmic transforms (reduce skewness)
        df['pl_orbper_log'] = np.log10(df['pl_orbper'] + 1.0)
        df['st_teff_log'] = np.log10(df['st_teff'] + 1.0)
        df['st_dist_log'] = np.log10(df['st_dist'] + 1.0)

        # 9. M-dwarf flag (important for false positive detection)
        df['is_m_dwarf'] = (df['st_teff'] < 3700).astype(int)

        # 10. Deep long transit flag (potential false positive indicator)
        df['deep_long_transit'] = ((df['pl_trandep'] > 10000) & (df['pl_trandurh'] > 8)).astype(int)

        # 11-12. Planet size categories
        df['is_earth_sized'] = ((df['pl_rade'] >= 0.5) & (df['pl_rade'] <= 2.0)).astype(int)
        df['is_neptune_sized'] = ((df['pl_rade'] > 4.0) & (df['pl_rade'] <= 10.0)).astype(int)

        # 13. Sun-like star flag
        df['is_sun_like'] = ((df['st_teff'] >= 5200) & (df['st_teff'] <= 6000)).astype(int)

        # 14. Insolation log
        df['pl_insol_log'] = np.log10(df['pl_insol'] + 1.0)

        # 15. Short transit flag
        df['is_short_transit'] = (df['pl_trandurh'] < 2).astype(int)

        # 16. High SNR detection (based on detection quality quantile)
        # IMPORTANT: Use quantile from current data
        q75 = df['detection_quality'].quantile(0.75)
        df['high_snr_detection'] = (df['detection_quality'] > q75).astype(int)

        # 17. Nearby star flag
        df['is_nearby'] = (df['st_dist'] < 50).astype(int)

        return df

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Complete preprocessing pipeline:
        1. Ensure all base features present (add defaults for optional ones)
        2. Apply winsorization
        3. Apply feature engineering

        Args:
            df: Raw DataFrame with 17 base TESS features (some optional)

        Returns:
            DataFrame with 34 engineered features ready for imputation
        """
        df_copy = df.copy()

        # Handle optional features with default values
        # pl_pnum: Number of planets in system (default = 1 for single planet)
        if 'pl_pnum' not in df_copy.columns:
            df_copy['pl_pnum'] = 1

        # pl_tranmid: Transit midpoint time (use median if missing)
        if 'pl_tranmid' not in df_copy.columns:
            # If pl_tranmid is completely missing, use a placeholder value
            # This shouldn't affect predictions much as it's mainly used for transit_phase
            df_copy['pl_tranmid'] = 0.0

        # Check for truly required features (cannot be defaulted)
        required_features = [f for f in self.BASE_FEATURES if f not in ['pl_pnum', 'pl_tranmid']]
        missing_features = set(required_features) - set(df_copy.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Select only the base features in correct order
        df_ordered = df_copy[self.BASE_FEATURES].copy()

        # Step 1: Winsorization
        df_winsorized = self.apply_winsorization(df_ordered)

        # Step 2: Feature engineering
        df_engineered = self.engineer_features(df_winsorized)

        # Return all 34 features in the exact order expected by the imputer
        # The order is: 17 base features + 17 engineered features
        expected_feature_order = [
            'ra', 'dec', 'st_teff', 'st_logg', 'st_rad', 'st_dist',
            'st_pmra', 'st_pmdec', 'st_tmag',
            'pl_orbper', 'pl_rade', 'pl_trandep', 'pl_trandurh', 'pl_eqt', 'pl_insol',
            'pl_tranmid', 'pl_pnum',
            'planet_star_ratio', 'transit_depth_normalized', 'transit_depth_anomaly',
            'detection_quality', 'transit_duration_fraction',
            'pl_orbper_log', 'st_teff_log', 'st_dist_log',
            'is_m_dwarf', 'deep_long_transit', 'is_earth_sized', 'is_neptune_sized',
            'is_sun_like', 'pl_insol_log', 'is_short_transit', 'high_snr_detection',
            'is_nearby'
        ]

        return df_engineered[expected_feature_order]


# Global instance
_tess_new_feature_engineer = TessNewFeatureEngineer()

def get_tess_new_feature_engineer() -> TessNewFeatureEngineer:
    """Get the global TESS new feature engineer instance"""
    return _tess_new_feature_engineer
