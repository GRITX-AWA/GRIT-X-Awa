"""
Simple TESS Model Training Script
Trains models on base 15 features without complex feature engineering
Compatible with original_features.csv
"""

import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import KNNImputer
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from sklearn.metrics import accuracy_score, classification_report

# Configuration
DATA_PATH = Path("../original_features.csv")
OUTPUT_DIR = Path("tess/trained_models")
TARGET_COL = "tfopwg_disp"

# Base features (15 features that work with current preprocessing)
FEATURE_COLS = [
    "ra", "dec", "st_teff", "st_logg", "st_rad", "st_dist",
    "st_pmra", "st_pmdec", "st_tmag", "pl_orbper", "pl_rade",
    "pl_trandep", "pl_trandurh", "pl_eqt", "pl_insol"
]

def load_and_preprocess_data():
    """Load CSV and prepare data"""
    print("Loading data from:", DATA_PATH)

    # Check if we need target column
    df = pd.read_csv(DATA_PATH, comment="#")
    print(f"Loaded {len(df)} rows")

    # Check if target exists
    if TARGET_COL not in df.columns:
        print(f"WARNING: Target column '{TARGET_COL}' not found in CSV")
        print(f"Available columns: {list(df.columns)}")
        print("\\nAssuming this is a prediction dataset (no training possible)")
        return None, None, df[FEATURE_COLS]

    # Select features and target
    X = df[FEATURE_COLS].copy()
    y = df[TARGET_COL].copy()

    print(f"Features shape: {X.shape}")
    print(f"Target classes: {y.value_counts().to_dict()}")

    return X, y, df

def train_models(X, y):
    """Train ensemble models"""
    print("\\n" + "="*60)
    print("TRAINING MODELS")
    print("="*60)

    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print(f"Target classes: {le.classes_}")

    # Impute missing values
    print("\\nImputing missing values...")
    imputer = KNNImputer(n_neighbors=5)
    X_imputed = imputer.fit_transform(X)

    # Apply SMOTE for class balance
    print("Applying SMOTE for class balance...")
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_imputed, y_encoded)
    print(f"After SMOTE: {X_resampled.shape[0]} samples")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_resampled, y_resampled, test_size=0.2, stratify=y_resampled, random_state=42
    )
    print(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # Train CatBoost
    print("\\nTraining CatBoost...")
    cat_model = CatBoostClassifier(
        iterations=500,
        learning_rate=0.1,
        depth=5,
        verbose=0,
        random_seed=42
    )
    cat_model.fit(X_train, y_train)
    cat_acc = accuracy_score(y_test, cat_model.predict(X_test))
    print(f"CatBoost test accuracy: {cat_acc:.4f}")

    # Train XGBoost
    print("\\nTraining XGBoost...")
    xgb_model = XGBClassifier(
        n_estimators=500,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        use_label_encoder=False,
        eval_metric="mlogloss"
    )
    xgb_model.fit(X_train, y_train)
    xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test))
    print(f"XGBoost test accuracy: {xgb_acc:.4f}")

    # Train LightGBM
    print("\\nTraining LightGBM...")
    lgbm_model = LGBMClassifier(
        n_estimators=500,
        learning_rate=0.1,
        max_depth=5,
        random_state=42,
        verbosity=-1
    )
    lgbm_model.fit(X_train, y_train)
    lgbm_acc = accuracy_score(y_test, lgbm_model.predict(X_test))
    print(f"LightGBM test accuracy: {lgbm_acc:.4f}")

    # Ensemble prediction
    print("\\nEvaluating ensemble...")
    w_cat, w_xgb, w_lgbm = 0.4, 0.35, 0.25

    cat_proba = cat_model.predict_proba(X_test)
    xgb_proba = xgb_model.predict_proba(X_test)
    lgbm_proba = lgbm_model.predict_proba(X_test)

    ensemble_proba = w_cat * cat_proba + w_xgb * xgb_proba + w_lgbm * lgbm_proba
    ensemble_pred = np.argmax(ensemble_proba, axis=1)
    ensemble_acc = accuracy_score(y_test, ensemble_pred)

    print(f"\\nEnsemble test accuracy: {ensemble_acc:.4f}")
    print("\\nClassification Report:")
    print(classification_report(y_test, ensemble_pred, target_names=le.classes_))

    return {
        'cat_model': cat_model,
        'xgb_model': xgb_model,
        'lgbm_model': lgbm_model,
        'imputer': imputer,
        'target_le': le,
        'encoders': {},  # No categorical encoders for TESS
        'metadata': {
            'feature_order': FEATURE_COLS,
            'weights': [w_cat, w_xgb, w_lgbm],
            'class_names': le.classes_.tolist(),
            'accuracies': {
                'catboost': float(cat_acc),
                'xgboost': float(xgb_acc),
                'lightgbm': float(lgbm_acc),
                'ensemble': float(ensemble_acc)
            }
        }
    }

def save_models(artifacts):
    """Save all model artifacts"""
    print("\\n" + "="*60)
    print("SAVING MODELS")
    print("="*60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Save models
    pickle.dump(artifacts['cat_model'], open(OUTPUT_DIR / 'cat_model.pkl', 'wb'))
    print(f"✓ Saved: cat_model.pkl")

    pickle.dump(artifacts['xgb_model'], open(OUTPUT_DIR / 'xgb_model.pkl', 'wb'))
    print(f"✓ Saved: xgb_model.pkl")

    pickle.dump(artifacts['lgbm_model'], open(OUTPUT_DIR / 'lgbm_model.pkl', 'wb'))
    print(f"✓ Saved: lgbm_model.pkl")

    pickle.dump(artifacts['imputer'], open(OUTPUT_DIR / 'imputer.pkl', 'wb'))
    print(f"✓ Saved: imputer.pkl")

    pickle.dump(artifacts['target_le'], open(OUTPUT_DIR / 'target_le.pkl', 'wb'))
    print(f"✓ Saved: target_le.pkl")

    pickle.dump(artifacts['encoders'], open(OUTPUT_DIR / 'encoders.pkl', 'wb'))
    print(f"✓ Saved: encoders.pkl")

    with open(OUTPUT_DIR / 'meta.json', 'w') as f:
        json.dump(artifacts['metadata'], f, indent=2)
    print(f"✓ Saved: meta.json")

    print(f"\\n✓ All models saved to: {OUTPUT_DIR}")

def main():
    """Main training pipeline"""
    print("\\n" + "="*60)
    print("SIMPLE TESS MODEL TRAINING")
    print("="*60)

    # Load data
    X, y, df = load_and_preprocess_data()

    if X is None or y is None:
        print("\\nERROR: Cannot train without target column")
        print("Please provide a CSV with the 'tfopwg_disp' column")
        return

    # Train models
    artifacts = train_models(X, y)

    # Save models
    save_models(artifacts)

    print("\\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\\nModels are now compatible with:")
    print("- original_features.csv (15 base features)")
    print("- Cloud Run deployment")
    print("- Current prediction pipeline")

if __name__ == "__main__":
    main()
