# app/services/model_loader.py
import pickle
import json
import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import numpy as np

# Try to import joblib for compatibility
try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False

class ModelLoader:
    """
    Loads and caches ensemble ML models (CatBoost, XGBoost, LightGBM)
    along with preprocessing artifacts (imputer, encoders) for Kepler and TESS datasets.
    """

    def __init__(self):
        self.base_path = Path(__file__).parent.parent.parent  # backend/
        self.kepler_path = self.base_path / "kepler"
        # TESS models - use improved models (91.13% confidence)
        self.tess_path = self.base_path / "tess" / "trained_models_improved"

        # Cache for loaded models
        self._kepler_cache: Optional[Dict[str, Any]] = None
        self._tess_cache: Optional[Dict[str, Any]] = None

    def _load_pickle(self, file_path: Path) -> Any:
        """Load a pickle or joblib file"""
        # Try joblib first (more common for sklearn models)
        if HAS_JOBLIB:
            try:
                return joblib.load(file_path)
            except Exception as e_joblib:
                # If joblib fails, try pickle
                try:
                    with open(file_path, 'rb') as f:
                        return pickle.load(f)
                except Exception as e_pickle:
                    raise Exception(f"Failed to load {file_path}: joblib error: {e_joblib}, pickle error: {e_pickle}")
        else:
            # Only pickle available
            with open(file_path, 'rb') as f:
                return pickle.load(f)

    def _load_json(self, file_path: Path) -> Dict:
        """Load a JSON file"""
        with open(file_path, 'r') as f:
            return json.load(f)

    def _load_model_set(self, model_dir: Path) -> Dict[str, Any]:
        """
        Load all model artifacts from a directory.
        Returns dict with: cat_model, xgb_model, lgbm_model, imputer, encoders, target_le, metadata
        """
        return {
            'cat_model': self._load_pickle(model_dir / 'cat_model.pkl'),
            'xgb_model': self._load_pickle(model_dir / 'xgb_model.pkl'),
            'lgbm_model': self._load_pickle(model_dir / 'lgbm_model.pkl'),
            'imputer': self._load_pickle(model_dir / 'imputer.pkl'),
            'encoders': self._load_pickle(model_dir / 'encoders.pkl'),
            'target_le': self._load_pickle(model_dir / 'target_le.pkl'),
            'metadata': self._load_json(model_dir / 'meta.json')
        }

    def get_kepler_models(self) -> Dict[str, Any]:
        """Get Kepler model set (cached after first load)"""
        if self._kepler_cache is None:
            self._kepler_cache = self._load_model_set(self.kepler_path)
        return self._kepler_cache

    def get_tess_models(self) -> Dict[str, Any]:
        """Get TESS model set (cached after first load)"""
        if self._tess_cache is None:
            self._tess_cache = self._load_model_set(self.tess_path)
        return self._tess_cache

    def get_models_by_type(self, dataset_type: str) -> Dict[str, Any]:
        """
        Get model set based on dataset type

        Args:
            dataset_type: 'kepler' or 'tess'

        Returns:
            Dictionary containing all model artifacts
        """
        dataset_type = dataset_type.lower()
        if dataset_type == 'kepler':
            return self.get_kepler_models()
        elif dataset_type == 'tess':
            return self.get_tess_models()
        else:
            raise ValueError(f"Unknown dataset type: {dataset_type}. Must be 'kepler' or 'tess'")

    def predict_ensemble(
        self,
        features: np.ndarray,
        dataset_type: str
    ) -> Tuple[np.ndarray, np.ndarray, list]:
        """
        Run ensemble prediction with weighted voting

        Args:
            features: Preprocessed feature array (already imputed and encoded)
            dataset_type: 'kepler' or 'tess'

        Returns:
            Tuple of (predicted_classes, confidence_probabilities, class_names)
        """
        models = self.get_models_by_type(dataset_type)

        # Get ensemble weights from metadata
        weights = models['metadata'].get('weights', [0.4, 0.35, 0.25])
        w1, w2, w3 = weights

        # Get predictions from each model
        cat_proba = models['cat_model'].predict_proba(features)
        xgb_proba = models['xgb_model'].predict_proba(features)
        lgbm_proba = models['lgbm_model'].predict_proba(features)

        # Weighted ensemble
        ensemble_proba = (w1 * cat_proba + w2 * xgb_proba + w3 * lgbm_proba)
        ensemble_pred = np.argmax(ensemble_proba, axis=1)

        # Get class names
        class_names = models['metadata'].get('class_names', [])

        return ensemble_pred, ensemble_proba, class_names

    def preload_all_models(self):
        """Preload both Kepler and TESS models into cache"""
        print("Preloading Kepler models...")
        self.get_kepler_models()
        print("✅ Kepler models loaded")

        print("Preloading TESS models...")
        self.get_tess_models()
        print("✅ TESS models loaded")


# Global instance
_model_loader = ModelLoader()

def get_model_loader() -> ModelLoader:
    """Get the global model loader instance"""
    return _model_loader
