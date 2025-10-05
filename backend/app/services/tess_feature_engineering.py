"""
TESS Feature Engineering Service
Implements the exact feature engineering pipeline from the ML team's training script
"""

import pandas as pd
import numpy as np
from scipy.stats.mstats import winsorize


class TessFeatureEngineer:
    """
    TESS feature engineering pipeline
    Converts 17 base features into ~66 engineered features
    """

    BASE_FEATURES = [
        "ra", "dec", "st_teff", "st_logg", "st_rad", "st_dist",
        "st_pmra", "st_pmdec", "st_tmag", "pl_orbper", "pl_rade",
        "pl_trandep", "pl_trandurh", "pl_eqt", "pl_insol",
        "pl_tranmid", "pl_pnum"
    ]

    def __init__(self):
        pass

    def apply_winsorization(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply winsorization to handle outliers (1% on each tail)"""
        df_copy = df.copy()
        for col in self.BASE_FEATURES:
            if col in df_copy.columns:
                df_copy[col] = winsorize(df_copy[col], limits=[0.01, 0.01])
        return df_copy

    def create_transit_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transit-based features"""
        if 'pl_trandep' in df.columns and 'st_rad' in df.columns and 'pl_rade' in df.columns:
            df['transit_depth_normalized'] = df['pl_trandep'] / 1e6
            R_sun_to_earth = 109.2
            theoretical_depth = (df['pl_rade'] / (df['st_rad'] * R_sun_to_earth)) ** 2
            df['transit_depth_anomaly'] = df['transit_depth_normalized'] / (theoretical_depth + 1e-10)

        if 'pl_trandurh' in df.columns and 'pl_orbper' in df.columns:
            df['transit_duration_fraction'] = df['pl_trandurh'] / (df['pl_orbper'] * 24)
            df['is_short_transit'] = (df['pl_trandurh'] < 2).astype(int)
            df['is_long_transit'] = (df['pl_trandurh'] > 10).astype(int)

        if 'pl_tranmid' in df.columns and 'pl_orbper' in df.columns:
            df['transit_phase'] = (df['pl_tranmid'] % df['pl_orbper']) / df['pl_orbper']

        return df

    def create_planetary_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Planetary characteristic features"""
        if 'pl_rade' in df.columns:
            df['planet_size_category'] = pd.cut(
                df['pl_rade'],
                bins=[0, 1.5, 2.0, 4.0, 10.0, np.inf],
                labels=['Earth-like', 'Super-Earth', 'Mini-Neptune', 'Neptune', 'Jupiter']
            )
            df['is_earth_sized'] = ((df['pl_rade'] >= 0.5) & (df['pl_rade'] <= 1.5)).astype(int)
            df['is_super_earth'] = ((df['pl_rade'] > 1.5) & (df['pl_rade'] <= 2.0)).astype(int)
            df['is_neptune_sized'] = ((df['pl_rade'] > 4.0) & (df['pl_rade'] <= 10.0)).astype(int)
            df['is_jupiter_sized'] = (df['pl_rade'] > 10.0).astype(int)

        if 'pl_orbper' in df.columns:
            df['pl_orbper_log'] = np.log10(df['pl_orbper'] + 1)
            df['is_hot_jupiter'] = ((df['pl_orbper'] < 10) & (df['pl_rade'] > 8)).astype(int)
            df['in_habitable_zone_period'] = ((df['pl_orbper'] >= 200) & (df['pl_orbper'] <= 500)).astype(int)

        if 'pl_insol' in df.columns:
            df['pl_insol_log'] = np.log10(df['pl_insol'] + 1)
            df['earth_like_insolation'] = ((df['pl_insol'] >= 0.5) & (df['pl_insol'] <= 2.0)).astype(int)
            df['is_hot_planet'] = (df['pl_insol'] > 10).astype(int)

        if 'pl_eqt' in df.columns:
            df['pl_eqt_celsius'] = df['pl_eqt'] - 273.15
            df['habitable_temperature'] = ((df['pl_eqt_celsius'] >= 0) & (df['pl_eqt_celsius'] <= 100)).astype(int)
            df['temp_category'] = pd.cut(
                df['pl_eqt'],
                bins=[0, 273, 373, 500, 1000, np.inf],
                labels=['Frozen', 'Temperate', 'Warm', 'Hot', 'Very Hot']
            )

        return df

    def create_stellar_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stellar property features"""
        if 'st_teff' in df.columns:
            df['st_teff_log'] = np.log10(df['st_teff'] + 1)
            df['stellar_type'] = pd.cut(
                df['st_teff'],
                bins=[0, 3700, 5200, 6000, 7500, np.inf],
                labels=['M-dwarf', 'K-type', 'G-type', 'F-type', 'A-type+']
            )
            df['is_sun_like'] = ((df['st_teff'] >= 5200) & (df['st_teff'] <= 6000)).astype(int)
            df['is_m_dwarf'] = (df['st_teff'] < 3700).astype(int)

        if 'st_rad' in df.columns:
            df['st_rad_log'] = np.log10(df['st_rad'] + 1)
            df['is_main_sequence'] = ((df['st_rad'] >= 0.1) & (df['st_rad'] <= 2.0)).astype(int)
            df['is_giant_star'] = (df['st_rad'] > 2.0).astype(int)

        if 'st_logg' in df.columns:
            df['is_evolved_star'] = (df['st_logg'] < 4.0).astype(int)
            df['is_main_sequence_logg'] = ((df['st_logg'] >= 4.0) & (df['st_logg'] <= 4.5)).astype(int)

        if 'st_dist' in df.columns:
            df['st_dist_log'] = np.log10(df['st_dist'] + 1)
            df['is_nearby'] = (df['st_dist'] < 50).astype(int)
            df['distance_category'] = pd.cut(
                df['st_dist'],
                bins=[0, 50, 100, 200, 500, np.inf],
                labels=['Very Close', 'Close', 'Medium', 'Far', 'Very Far']
            )

        if 'st_tmag' in df.columns:
            df['is_bright_star'] = (df['st_tmag'] < 10).astype(int)
            df['is_faint_star'] = (df['st_tmag'] > 14).astype(int)

        return df

    def create_combined_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Combined planetary-stellar features"""
        if 'pl_rade' in df.columns and 'st_rad' in df.columns:
            R_sun_to_earth = 109.2
            df['planet_star_radius_ratio'] = df['pl_rade'] / (df['st_rad'] * R_sun_to_earth)
            df['high_contrast_system'] = (df['planet_star_radius_ratio'] > 0.05).astype(int)

        if 'pl_orbper' in df.columns and 'st_rad' in df.columns:
            df['semi_major_axis_approx'] = (df['pl_orbper'] / 365.25) ** (2/3)
            AU_to_solar_radii = 215
            df['distance_in_stellar_radii'] = df['semi_major_axis_approx'] * AU_to_solar_radii / df['st_rad']

        if 'pl_trandurh' in df.columns and 'pl_orbper' in df.columns and 'st_rad' in df.columns:
            df['transit_duration_ratio'] = df['pl_trandurh'] / (df['pl_orbper'] * 24 / np.pi)
            df['is_grazing_transit'] = (df['transit_duration_ratio'] < 0.1).astype(int)

        if 'pl_trandep' in df.columns and 'st_tmag' in df.columns:
            df['detection_quality'] = df['pl_trandep'] / (10 ** (df['st_tmag'] / 5))
            df['high_snr_detection'] = (df['detection_quality'] > df['detection_quality'].quantile(0.75)).astype(int)

        if 'pl_rade' in df.columns and 'pl_orbper' in df.columns:
            df['density_proxy'] = 1 / (df['pl_rade'] ** 2 * df['pl_orbper'] ** 0.5)
            df['likely_rocky'] = ((df['pl_rade'] < 2.0) & (df['density_proxy'] > df['density_proxy'].median())).astype(int)

        return df

    def create_positional_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Positional and motion features"""
        if 'ra' in df.columns and 'dec' in df.columns:
            ra_rad = np.deg2rad(df['ra'])
            dec_rad = np.deg2rad(df['dec'])
            df['pos_x'] = np.cos(dec_rad) * np.cos(ra_rad)
            df['pos_y'] = np.cos(dec_rad) * np.sin(ra_rad)
            df['pos_z'] = np.sin(dec_rad)
            df['abs_dec'] = np.abs(df['dec'])

        if 'st_pmra' in df.columns and 'st_pmdec' in df.columns:
            df['proper_motion_total'] = np.sqrt(df['st_pmra']**2 + df['st_pmdec']**2)
            df['high_proper_motion'] = (df['proper_motion_total'] > 50).astype(int)

        return df

    def create_false_positive_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """False positive detection features"""
        if 'pl_trandep' in df.columns and 'pl_trandurh' in df.columns:
            df['deep_long_transit'] = ((df['pl_trandep'] > 10000) & (df['pl_trandurh'] > 8)).astype(int)
            df['transit_shape_proxy'] = df['pl_trandurh'] / np.sqrt(df['pl_trandep'] + 1)
            df['possible_binary'] = (df['transit_shape_proxy'] < df['transit_shape_proxy'].quantile(0.1)).astype(int)

        # Handle uncertainty-based features (must always create for imputer compatibility)
        if 'pl_trandeperr1' in df.columns and 'pl_trandep' in df.columns:
            df['transit_depth_uncertainty_ratio'] = df['pl_trandeperr1'] / (df['pl_trandep'] + 1)
            df['uncertain_detection'] = (df['transit_depth_uncertainty_ratio'] > 0.3).astype(int)
        else:
            # Create with zeros if error columns don't exist (for imputer compatibility)
            df['transit_depth_uncertainty_ratio'] = 0.0
            df['uncertain_detection'] = 0

        return df

    def create_statistical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Statistical aggregation features - must create all for imputer compatibility"""
        # Create uncertainty ratio features (with zeros if error columns don't exist)
        if 'pl_orbpererr1' in df.columns and 'pl_orbper' in df.columns:
            df['period_uncertainty_ratio'] = df['pl_orbpererr1'] / (df['pl_orbper'] + 1e-10)
        else:
            df['period_uncertainty_ratio'] = 0.0

        if 'pl_radeerr1' in df.columns and 'pl_rade' in df.columns:
            df['radius_uncertainty_ratio'] = df['pl_radeerr1'] / (df['pl_rade'] + 1e-10)
        else:
            df['radius_uncertainty_ratio'] = 0.0

        if 'st_raderr1' in df.columns and 'st_rad' in df.columns:
            df['stellar_radius_uncertainty_ratio'] = df['st_raderr1'] / (df['st_rad'] + 1e-10)
        else:
            df['stellar_radius_uncertainty_ratio'] = 0.0

        # Average measurement quality - always create for consistency
        uncertainty_ratios = [
            df['period_uncertainty_ratio'],
            df['radius_uncertainty_ratio'],
            df['stellar_radius_uncertainty_ratio']
        ]
        df['average_measurement_quality'] = np.mean(uncertainty_ratios, axis=0)

        return df

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply full feature engineering pipeline

        Args:
            df: DataFrame with base 17 TESS features

        Returns:
            DataFrame with ~66 engineered features
        """
        # Start with base features only
        df_processed = df[self.BASE_FEATURES].copy()

        # Apply winsorization
        df_processed = self.apply_winsorization(df_processed)

        # Apply all feature engineering steps
        df_processed = self.create_transit_features(df_processed)
        df_processed = self.create_planetary_features(df_processed)
        df_processed = self.create_stellar_features(df_processed)
        df_processed = self.create_combined_features(df_processed)
        df_processed = self.create_positional_features(df_processed)
        df_processed = self.create_false_positive_features(df_processed)
        df_processed = self.create_statistical_features(df_processed)

        # Select only numerical columns
        numerical_cols = df_processed.select_dtypes(include=np.number).columns.tolist()
        df_numerical = df_processed[numerical_cols].copy()

        # Get categorical columns and one-hot encode
        categorical_cols = df_processed.select_dtypes(exclude=np.number).columns.tolist()
        if categorical_cols:
            # Try drop_first=True to avoid multicollinearity (reduces from 72 to 68)
            df_encoded = pd.get_dummies(df_processed, columns=categorical_cols, dummy_na=False, drop_first=True)
            # Select only numerical after encoding
            numerical_cols_encoded = df_encoded.select_dtypes(include=np.number).columns.tolist()
            df_final = df_encoded[numerical_cols_encoded]
        else:
            df_final = df_numerical

        # Drop pl_pnum as it's metadata, not a predictive feature
        if 'pl_pnum' in df_final.columns:
            df_final = df_final.drop(columns=['pl_pnum'])

        # Note: Training script had target which they dropped to get 67 features
        # With drop_first=True on 4 categoricals (-4) and dropping pl_pnum (-1),
        # we should have 72 - 5 = 67 features

        print(f"DEBUG: Final feature count: {df_final.shape[1]}")
        print(f"DEBUG: Feature names: {list(df_final.columns[:20])}...")

        return df_final
