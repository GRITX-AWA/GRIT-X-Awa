"""
TESS Improved Feature Engineering
Matches the features used in train_improved_tess_model.py
For models with 91.13% confidence
"""

import pandas as pd
import numpy as np

def engineer_improved_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add engineered features matching the improved TESS model training
    
    Args:
        df: DataFrame with base TESS features
        
    Returns:
        DataFrame with all features (base + engineered)
    """
    df_out = df.copy()
    
    # Transit-based features
    if 'pl_trandep' in df_out.columns and 'pl_rade' in df_out.columns and 'st_rad' in df_out.columns:
        R_sun_to_earth = 109.2
        theoretical_depth = (df_out['pl_rade'] / (df_out['st_rad'] * R_sun_to_earth)) ** 2
        df_out['transit_depth_normalized'] = df_out['pl_trandep'] / 1e6
        df_out['transit_depth_anomaly'] = df_out['transit_depth_normalized'] / (theoretical_depth + 1e-10)
    
    if 'pl_trandurh' in df_out.columns and 'pl_orbper' in df_out.columns:
        df_out['transit_duration_fraction'] = df_out['pl_trandurh'] / (df_out['pl_orbper'] * 24)
    
    # Planet-star ratio
    if 'pl_rade' in df_out.columns and 'st_rad' in df_out.columns:
        R_sun_to_earth = 109.2
        df_out['planet_star_radius_ratio'] = df_out['pl_rade'] / (df_out['st_rad'] * R_sun_to_earth)
    
    # Orbital characteristics
    if 'pl_orbper' in df_out.columns:
        df_out['pl_orbper_log'] = np.log10(df_out['pl_orbper'] + 1)
    
    if 'pl_insol' in df_out.columns:
        df_out['pl_insol_log'] = np.log10(df_out['pl_insol'] + 1)
    
    # Stellar properties
    if 'st_teff' in df_out.columns:
        df_out['st_teff_log'] = np.log10(df_out['st_teff'] + 1)
        df_out['is_sun_like'] = ((df_out['st_teff'] >= 5200) & (df_out['st_teff'] <= 6000)).astype(int)
    
    if 'st_dist' in df_out.columns:
        df_out['st_dist_log'] = np.log10(df_out['st_dist'] + 1)
        df_out['is_nearby'] = (df_out['st_dist'] < 50).astype(int)
    
    # Detection quality
    if 'pl_trandep' in df_out.columns and 'st_tmag' in df_out.columns:
        df_out['detection_quality'] = df_out['pl_trandep'] / (10 ** (df_out['st_tmag'] / 5))
    
    # Proper motion
    if 'st_pmra' in df_out.columns and 'st_pmdec' in df_out.columns:
        df_out['proper_motion_total'] = np.sqrt(df_out['st_pmra']**2 + df_out['st_pmdec']**2)
    
    return df_out


def get_improved_tess_feature_order():
    """
    Get the correct feature order for the improved TESS model
    """
    return [
        # Base features (16)
        "ra", "dec", "st_teff", "st_logg", "st_rad", "st_dist",
        "st_pmra", "st_pmdec", "st_tmag", "pl_orbper", "pl_rade",
        "pl_trandep", "pl_trandurh", "pl_eqt", "pl_insol",
        "pl_tranmid",
        # Engineered features (12)
        "transit_depth_normalized",
        "transit_depth_anomaly",
        "transit_duration_fraction",
        "planet_star_radius_ratio",
        "pl_orbper_log",
        "pl_insol_log",
        "st_teff_log",
        "is_sun_like",
        "st_dist_log",
        "is_nearby",
        "detection_quality",
        "proper_motion_total"
    ]
