"""
IMPROVED TESS Model Training Script
Based on Kepler model's success factors:
- Optimized hyperparameters (Kepler-inspired)
- Better feature selection
- Deeper trees, more estimators
- Target: >90% confidence
"""

import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import KNNImputer
from sklearn.model_selection import train_test_split, StratifiedKFold
from catboost import CatBoostClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings("ignore")

# Configuration
DATA_PATH = Path("../csv/TOI_2025.10.05_11.28.40.csv")
OUTPUT_DIR = Path("tess/trained_models_improved")
TARGET_COL = "tfopwg_disp"

# Base features (16 features - pl_pnum not available in current dataset)
BASE_FEATURES = [
    "ra", "dec", "st_teff", "st_logg", "st_rad", "st_dist",
    "st_pmra", "st_pmdec", "st_tmag", "pl_orbper", "pl_rade",
    "pl_trandep", "pl_trandurh", "pl_eqt", "pl_insol",
    "pl_tranmid"
]

print("="*70)
print("IMPROVED TESS MODEL TRAINING")
print("Kepler-Inspired Optimization")
print("="*70)

def load_data():
    """Load and prepare data"""
    print("\n[1/7] Loading data...")
    df = pd.read_csv(DATA_PATH, comment="#")
    print(f"   Loaded {len(df)} rows")
    
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found")
    
    # Select features and target
    X = df[BASE_FEATURES].copy()
    y = df[TARGET_COL].copy()
    
    print(f"   Features: {X.shape[1]}")
    print(f"   Classes: {y.value_counts().to_dict()}")
    
    return X, y


def engineer_key_features(X):
    """
    Add only HIGH-IMPACT engineered features
    Based on feature importance analysis
    """
    print("\n[2/7] Engineering key features...")
    
    df = X.copy()
    initial_count = df.shape[1]
    
    # Transit-based features (MOST IMPORTANT)
    if 'pl_trandep' in df.columns and 'pl_rade' in df.columns and 'st_rad' in df.columns:
        R_sun_to_earth = 109.2
        theoretical_depth = (df['pl_rade'] / (df['st_rad'] * R_sun_to_earth)) ** 2
        df['transit_depth_normalized'] = df['pl_trandep'] / 1e6
        df['transit_depth_anomaly'] = df['transit_depth_normalized'] / (theoretical_depth + 1e-10)
    
    if 'pl_trandurh' in df.columns and 'pl_orbper' in df.columns:
        df['transit_duration_fraction'] = df['pl_trandurh'] / (df['pl_orbper'] * 24)
    
    # Planet-star ratio (HIGH SIGNAL)
    if 'pl_rade' in df.columns and 'st_rad' in df.columns:
        R_sun_to_earth = 109.2
        df['planet_star_radius_ratio'] = df['pl_rade'] / (df['st_rad'] * R_sun_to_earth)
    
    # Orbital characteristics
    if 'pl_orbper' in df.columns:
        df['pl_orbper_log'] = np.log10(df['pl_orbper'] + 1)
    
    if 'pl_insol' in df.columns:
        df['pl_insol_log'] = np.log10(df['pl_insol'] + 1)
    
    # Stellar properties
    if 'st_teff' in df.columns:
        df['st_teff_log'] = np.log10(df['st_teff'] + 1)
        df['is_sun_like'] = ((df['st_teff'] >= 5200) & (df['st_teff'] <= 6000)).astype(int)
    
    if 'st_dist' in df.columns:
        df['st_dist_log'] = np.log10(df['st_dist'] + 1)
        df['is_nearby'] = (df['st_dist'] < 50).astype(int)
    
    # Detection quality
    if 'pl_trandep' in df.columns and 'st_tmag' in df.columns:
        df['detection_quality'] = df['pl_trandep'] / (10 ** (df['st_tmag'] / 5))
    
    # Proper motion
    if 'st_pmra' in df.columns and 'st_pmdec' in df.columns:
        df['proper_motion_total'] = np.sqrt(df['st_pmra']**2 + df['st_pmdec']**2)
    
    new_count = df.shape[1] - initial_count
    print(f"   Added {new_count} engineered features")
    print(f"   Total features: {df.shape[1]}")
    
    return df


def analyze_feature_importance(X, y):
    """Quick feature importance analysis"""
    print("\n[3/7] Analyzing feature importance...")
    
    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Impute
    imputer = KNNImputer(n_neighbors=5)
    X_imputed = imputer.fit_transform(X)
    
    # Quick RF for importance
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_imputed, y_encoded)
    
    # Get top features
    importance_df = pd.DataFrame({
        'feature': X.columns,
        'importance': rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n   TOP 15 FEATURES:")
    for idx, row in importance_df.head(15).iterrows():
        print(f"   {row['feature']:<35} {row['importance']:.4f}")
    
    return importance_df


def train_improved_models(X, y):
    """
    Train with KEPLER-INSPIRED hyperparameters
    Key changes:
    - Deeper trees (7-9 vs 5)
    - More estimators (800-1400 vs 500-650)
    - Higher learning rates
    - Better regularization
    """
    print("\n[4/7] Training improved models...")
    
    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print(f"   Classes: {le.classes_}")
    
    # Impute missing values
    print("   Imputing missing values...")
    imputer = KNNImputer(n_neighbors=5)
    X_imputed = imputer.fit_transform(X)
    
    # SMOTE for class balance
    print("   Applying SMOTE...")
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_imputed, y_encoded)
    print(f"   After SMOTE: {X_resampled.shape[0]} samples")
    
    # Split: 70% train, 20% val, 10% test (like Kepler: 80/11/9)
    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X_resampled, y_resampled, test_size=0.1, random_state=42, stratify=y_resampled
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval, test_size=2/9, random_state=42, stratify=y_trainval
    )
    
    print(f"   Train: {X_train.shape[0]}, Val: {X_val.shape[0]}, Test: {X_test.shape[0]}")
    
    # ===== IMPROVED HYPERPARAMETERS (KEPLER-INSPIRED) =====
    
    print("\n   Training CatBoost (Kepler-inspired params)...")
    cat_model = CatBoostClassifier(
        iterations=900,           # Increased from 992 (Kepler: 808)
        learning_rate=0.12,       # Similar to Kepler's 0.012 scaled up
        depth=8,                  # Increased from 5 (Kepler: 9)
        l2_leaf_reg=5.0,         # Increased from 2.42 (Kepler: 5.93)
        verbose=0,
        random_seed=42
    )
    cat_model.fit(X_train, y_train)
    cat_val_acc = accuracy_score(y_val, cat_model.predict(X_val))
    cat_test_acc = accuracy_score(y_test, cat_model.predict(X_test))
    print(f"   CatBoost - Val: {cat_val_acc:.4f}, Test: {cat_test_acc:.4f}")
    
    print("\n   Training XGBoost (Kepler-inspired params)...")
    xgb_model = XGBClassifier(
        n_estimators=1000,        # Increased from 654 (Kepler: 943)
        learning_rate=0.20,       # Increased from 0.058 (Kepler: 0.285)
        max_depth=9,              # Increased from 7 (Kepler: 9)
        subsample=0.88,           # Similar to Kepler's 0.855
        colsample_bytree=0.80,    # Slightly higher
        random_state=42,
        use_label_encoder=False,
        eval_metric="mlogloss",
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    xgb_val_acc = accuracy_score(y_val, xgb_model.predict(X_val))
    xgb_test_acc = accuracy_score(y_test, xgb_model.predict(X_test))
    print(f"   XGBoost - Val: {xgb_val_acc:.4f}, Test: {xgb_test_acc:.4f}")
    
    print("\n   Training LightGBM (Kepler-inspired params)...")
    lgbm_model = LGBMClassifier(
        n_estimators=1400,        # Increased from 536 (Kepler: 1395)
        learning_rate=0.045,      # Increased from 0.016 (Kepler: 0.045)
        max_depth=8,              # Decreased from 10 (Kepler: 7)
        num_leaves=100,           # Increased from 84 (Kepler: 99)
        min_data_in_leaf=50,      # Decreased from 100
        subsample=0.70,           # Similar to Kepler's ~0.65
        colsample_bytree=0.85,    # Higher
        random_state=42,
        verbosity=-1,
        n_jobs=-1
    )
    lgbm_model.fit(X_train, y_train)
    lgbm_val_acc = accuracy_score(y_val, lgbm_model.predict(X_val))
    lgbm_test_acc = accuracy_score(y_test, lgbm_model.predict(X_test))
    print(f"   LightGBM - Val: {lgbm_val_acc:.4f}, Test: {lgbm_test_acc:.4f}")
    
    # Ensemble weights (keep same as Kepler)
    w_cat, w_xgb, w_lgbm = 0.4, 0.35, 0.25
    
    # Validation ensemble
    cat_val_proba = cat_model.predict_proba(X_val)
    xgb_val_proba = xgb_model.predict_proba(X_val)
    lgbm_val_proba = lgbm_model.predict_proba(X_val)
    
    ensemble_val_proba = w_cat * cat_val_proba + w_xgb * xgb_val_proba + w_lgbm * lgbm_val_proba
    ensemble_val_pred = np.argmax(ensemble_val_proba, axis=1)
    ensemble_val_acc = accuracy_score(y_val, ensemble_val_pred)
    
    # Test ensemble
    cat_test_proba = cat_model.predict_proba(X_test)
    xgb_test_proba = xgb_model.predict_proba(X_test)
    lgbm_test_proba = lgbm_model.predict_proba(X_test)
    
    ensemble_test_proba = w_cat * cat_test_proba + w_xgb * xgb_test_proba + w_lgbm * lgbm_test_proba
    ensemble_test_pred = np.argmax(ensemble_test_proba, axis=1)
    ensemble_test_acc = accuracy_score(y_test, ensemble_test_pred)
    
    print(f"\n   ✅ Ensemble - Val: {ensemble_val_acc:.4f}, Test: {ensemble_test_acc:.4f}")
    
    # Additional metrics
    ensemble_f1 = f1_score(y_test, ensemble_test_pred, average='macro')
    ensemble_precision = precision_score(y_test, ensemble_test_pred, average='macro')
    ensemble_recall = recall_score(y_test, ensemble_test_pred, average='macro')
    
    try:
        ensemble_auc = roc_auc_score(y_test, ensemble_test_proba, multi_class='ovr', average='macro')
    except:
        ensemble_auc = 0.0
    
    print(f"   Precision: {ensemble_precision:.4f}")
    print(f"   Recall: {ensemble_recall:.4f}")
    print(f"   F1: {ensemble_f1:.4f}")
    if ensemble_auc > 0:
        print(f"   ROC-AUC: {ensemble_auc:.4f}")
    
    # Calculate confidence metrics
    confidences = np.max(ensemble_test_proba, axis=1)
    avg_confidence = np.mean(confidences) * 100
    high_conf_pct = (np.sum(confidences >= 0.9) / len(confidences)) * 100
    
    print(f"\n   📊 CONFIDENCE METRICS:")
    print(f"   Average Confidence: {avg_confidence:.2f}%")
    print(f"   High Confidence (>=90%): {high_conf_pct:.1f}%")
    
    return {
        'cat_model': cat_model,
        'xgb_model': xgb_model,
        'lgbm_model': lgbm_model,
        'imputer': imputer,
        'target_le': le,
        'encoders': {},
        'metadata': {
            'feature_order': list(X.columns),
            'weights': [w_cat, w_xgb, w_lgbm],
            'class_names': le.classes_.tolist(),
            'accuracies': {
                'catboost_val': float(cat_val_acc),
                'xgboost_val': float(xgb_val_acc),
                'lightgbm_val': float(lgbm_val_acc),
                'ensemble_val': float(ensemble_val_acc),
                'catboost_test': float(cat_test_acc),
                'xgboost_test': float(xgb_test_acc),
                'lightgbm_test': float(lgbm_test_acc),
                'ensemble_test': float(ensemble_test_acc)
            },
            'metrics': {
                'precision': float(ensemble_precision),
                'recall': float(ensemble_recall),
                'f1_score': float(ensemble_f1),
                'roc_auc': float(ensemble_auc),
                'avg_confidence': float(avg_confidence),
                'high_confidence_pct': float(high_conf_pct)
            },
            'hyperparameters': {
                'catboost': {
                    'iterations': 900,
                    'learning_rate': 0.12,
                    'depth': 8,
                    'l2_leaf_reg': 5.0
                },
                'xgboost': {
                    'n_estimators': 1000,
                    'learning_rate': 0.20,
                    'max_depth': 9,
                    'subsample': 0.88
                },
                'lightgbm': {
                    'n_estimators': 1400,
                    'learning_rate': 0.045,
                    'max_depth': 8,
                    'num_leaves': 100
                }
            }
        },
        'test_data': (X_test, y_test)
    }


def cross_validate(X, y, models_config):
    """20-Fold Cross-Validation like Kepler"""
    print("\n[5/7] Running 20-Fold Cross-Validation...")
    
    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Impute
    imputer = KNNImputer(n_neighbors=5)
    X_imputed = imputer.fit_transform(X)
    
    # SMOTE
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_imputed, y_encoded)
    
    kf = StratifiedKFold(n_splits=20, shuffle=True, random_state=42)
    fold_accs = []
    
    w_cat, w_xgb, w_lgbm = 0.4, 0.35, 0.25
    
    for i, (train_idx, val_idx) in enumerate(kf.split(X_resampled, y_resampled), 1):
        X_tr, X_va = X_resampled[train_idx], X_resampled[val_idx]
        y_tr, y_va = y_resampled[train_idx], y_resampled[val_idx]
        
        # Train models with same hyperparameters
        cat = CatBoostClassifier(iterations=900, learning_rate=0.12, depth=8, l2_leaf_reg=5.0, verbose=0, random_seed=42)
        xgb = XGBClassifier(n_estimators=1000, learning_rate=0.20, max_depth=9, subsample=0.88, colsample_bytree=0.80, random_state=42, use_label_encoder=False, eval_metric="mlogloss")
        lgbm = LGBMClassifier(n_estimators=1400, learning_rate=0.045, max_depth=8, num_leaves=100, min_data_in_leaf=50, subsample=0.70, colsample_bytree=0.85, random_state=42, verbosity=-1)
        
        cat.fit(X_tr, y_tr)
        xgb.fit(X_tr, y_tr)
        lgbm.fit(X_tr, y_tr)
        
        cat_p = cat.predict_proba(X_va)
        xgb_p = xgb.predict_proba(X_va)
        lgbm_p = lgbm.predict_proba(X_va)
        
        ensemble_p = w_cat * cat_p + w_xgb * xgb_p + w_lgbm * lgbm_p
        ensemble_pred = np.argmax(ensemble_p, axis=1)
        
        acc = accuracy_score(y_va, ensemble_pred)
        fold_accs.append(acc)
        
        if i % 5 == 0:
            print(f"   Fold {i}/20: {acc:.4f}")
    
    avg_acc = np.mean(fold_accs)
    best_acc = np.max(fold_accs)
    
    print(f"\n   Average CV Accuracy: {avg_acc:.4f}")
    print(f"   Best Fold Accuracy: {best_acc:.4f}")
    
    return fold_accs


def save_models(artifacts):
    """Save all model artifacts"""
    print("\n[6/7] Saving improved models...")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    pickle.dump(artifacts['cat_model'], open(OUTPUT_DIR / 'cat_model.pkl', 'wb'))
    pickle.dump(artifacts['xgb_model'], open(OUTPUT_DIR / 'xgb_model.pkl', 'wb'))
    pickle.dump(artifacts['lgbm_model'], open(OUTPUT_DIR / 'lgbm_model.pkl', 'wb'))
    pickle.dump(artifacts['imputer'], open(OUTPUT_DIR / 'imputer.pkl', 'wb'))
    pickle.dump(artifacts['target_le'], open(OUTPUT_DIR / 'target_le.pkl', 'wb'))
    pickle.dump(artifacts['encoders'], open(OUTPUT_DIR / 'encoders.pkl', 'wb'))
    
    with open(OUTPUT_DIR / 'meta.json', 'w') as f:
        json.dump(artifacts['metadata'], f, indent=2)
    
    print(f"   ✅ Models saved to: {OUTPUT_DIR}")


def generate_report(artifacts, cv_results):
    """Generate improvement report"""
    print("\n[7/7] Generating improvement report...")
    
    meta = artifacts['metadata']
    
    report = f"""
# TESS Model Improvement Report
**Generated: October 5, 2025**

## Summary
🎯 **Goal**: Improve TESS model confidence from ~72% to >90%

## Results

### Model Performance
- **Ensemble Test Accuracy**: {meta['accuracies']['ensemble_test']:.2%}
- **Average Confidence**: {meta['metrics']['avg_confidence']:.1f}%
- **High Confidence (>=90%)**: {meta['metrics']['high_confidence_pct']:.1f}%

### Individual Model Performance (Test Set)
- CatBoost: {meta['accuracies']['catboost_test']:.2%}
- XGBoost: {meta['accuracies']['xgboost_test']:.2%}
- LightGBM: {meta['accuracies']['lightgbm_test']:.2%}

### Additional Metrics
- Precision (macro): {meta['metrics']['precision']:.2%}
- Recall (macro): {meta['metrics']['recall']:.2%}
- F1-Score (macro): {meta['metrics']['f1_score']:.2%}
- ROC-AUC: {meta['metrics']['roc_auc']:.2%}

### Cross-Validation (20-Fold)
- Average Accuracy: {np.mean(cv_results):.2%}
- Best Fold: {np.max(cv_results):.2%}
- Std Dev: {np.std(cv_results):.4f}

## Key Improvements

### Hyperparameter Changes (vs Original)
**CatBoost:**
- Depth: 5 → 8 (deeper trees)
- L2 Regularization: 2.42 → 5.0 (better generalization)

**XGBoost:**
- Estimators: 654 → 1000 (more trees)
- Learning Rate: 0.058 → 0.20 (faster convergence)
- Max Depth: 7 → 9 (deeper trees)

**LightGBM:**
- Estimators: 536 → 1400 (significantly more trees)
- Learning Rate: 0.016 → 0.045 (3x increase!)
- Num Leaves: 84 → 100 (more complexity)

### Feature Engineering
- Total Features: {len(meta['feature_order'])}
- Base Features: {len(BASE_FEATURES)}
- Engineered Features: {len(meta['feature_order']) - len(BASE_FEATURES)}

## Comparison with Kepler

| Metric | Kepler | TESS (Old) | TESS (Improved) | Status |
|--------|--------|------------|-----------------|--------|
| Confidence | 98% | 72% | {meta['metrics']['avg_confidence']:.1f}% | {'✅ GOAL MET' if meta['metrics']['avg_confidence'] >= 90 else '⚠️ CLOSE' if meta['metrics']['avg_confidence'] >= 85 else '❌ BELOW TARGET'} |
| Test Accuracy | ~98% | ~75% | {meta['accuracies']['ensemble_test']:.1%} | {'✅' if meta['accuracies']['ensemble_test'] >= 0.90 else '⚠️'} |
| High Conf % | ~95% | ~40% | {meta['metrics']['high_confidence_pct']:.1f}% | {'✅' if meta['metrics']['high_confidence_pct'] >= 70 else '⚠️'} |

## Next Steps

{'### ✅ Success! Deploy Improved Model' if meta['metrics']['avg_confidence'] >= 90 else '### ⚠️ Further Optimization Needed'}

{'''1. Replace models in tess/trained_models/
2. Update production deployment
3. Monitor real-world performance
4. Collect user feedback''' if meta['metrics']['avg_confidence'] >= 90 else '''1. Consider reducing class count (6 → 4)
2. Collect more training data
3. Try ensemble weight optimization
4. Experiment with neural networks'''}

## Files Generated
- `tess/trained_models_improved/cat_model.pkl`
- `tess/trained_models_improved/xgb_model.pkl`
- `tess/trained_models_improved/lgbm_model.pkl`
- `tess/trained_models_improved/imputer.pkl`
- `tess/trained_models_improved/target_le.pkl`
- `tess/trained_models_improved/encoders.pkl`
- `tess/trained_models_improved/meta.json`

---
*Training completed successfully*
"""
    
    report_path = OUTPUT_DIR / 'IMPROVEMENT_REPORT.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"   ✅ Report saved to: {report_path}")
    
    return report


def main():
    """Main training pipeline"""
    try:
        # Load data
        X, y = load_data()
        
        # Engineer features
        X_engineered = engineer_key_features(X)
        
        # Analyze features
        feature_importance = analyze_feature_importance(X_engineered, y)
        
        # Train improved models
        artifacts = train_improved_models(X_engineered, y)
        
        # Cross-validation
        cv_results = cross_validate(X_engineered, y, artifacts)
        
        # Save models
        save_models(artifacts)
        
        # Generate report
        report = generate_report(artifacts, cv_results)
        
        print("\n" + "="*70)
        print("TRAINING COMPLETE!")
        print("="*70)
        
        # Print summary
        meta = artifacts['metadata']
        print(f"\n📊 FINAL RESULTS:")
        print(f"   Test Accuracy: {meta['accuracies']['ensemble_test']:.2%}")
        print(f"   Avg Confidence: {meta['metrics']['avg_confidence']:.1f}%")
        print(f"   High Conf %: {meta['metrics']['high_confidence_pct']:.1f}%")
        
        if meta['metrics']['avg_confidence'] >= 90:
            print("\n   🎉 SUCCESS! Confidence target achieved!")
        elif meta['metrics']['avg_confidence'] >= 85:
            print("\n   ⚠️ Close to target. Consider further optimization.")
        else:
            print("\n   ⚠️ Below target. Additional improvements needed.")
        
        print(f"\n   See full report: {OUTPUT_DIR / 'IMPROVEMENT_REPORT.md'}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
