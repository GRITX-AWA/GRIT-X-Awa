import pickle
from pathlib import Path
import sys

# Fix encoding
sys.modules['sklearn.externals.joblib'] = __import__('joblib')

# Load the TESS models
tess_path = Path("tess/trained_models")

print("Loading TESS imputer...")
try:
    import joblib
    imputer = joblib.load(tess_path / "imputer.pkl")
except:
    with open(tess_path / "imputer.pkl", "rb") as f:
        imputer = pickle.load(f)

print(f"\nImputer expects {imputer.n_features_in_} features")
print(f"Imputer feature names: {getattr(imputer, 'feature_names_in_', 'Not available')}")

print("\nLoading meta.json...")
import json
with open(tess_path / "meta.json", "r") as f:
    meta = json.load(f)

print(f"\nMeta.json says feature_order has {len(meta['feature_order'])} features:")
print(meta['feature_order'])

print("\n" + "="*60)
print("MISMATCH DETECTED!" if imputer.n_features_in_ != len(meta['feature_order']) else "OK")
print("="*60)
