"""
Test the new TESS model (v2.0) with feature engineering
Expected accuracy: 92.3%
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import sys
sys.path.insert(0, str(Path(__file__).parent))

from app.services.csv_service import CSVProcessor
from app.services.model_loader import ModelLoader

def test_new_tess_model():
    """Test new TESS model accuracy"""

    # Load the training data
    data_path = Path("../csv/TOI_2025.10.05_11.28.40.csv")
    df = pd.read_csv(data_path, comment='#')

    print("="*70)
    print("TESTING NEW TESS MODEL v2.0 WITH FEATURE ENGINEERING")
    print("="*70)
    print(f"\nLoaded {len(df)} rows from training data")
    print(f"\nTarget distribution:")
    print(df['tfopwg_disp'].value_counts())

    # Initialize processors
    csv_processor = CSVProcessor()
    model_loader = ModelLoader()

    # Check model metadata
    models = model_loader.get_tess_models()
    metadata = models['metadata']
    print(f"\n{'='*70}")
    print("MODEL METADATA")
    print("="*70)
    print(f"Model version: {metadata.get('model_version', 'unknown')}")
    print(f"Model type: {metadata.get('model_type', 'unknown')}")
    print(f"Requires feature engineering: {metadata.get('requires_feature_engineering', False)}")
    print(f"Base features: {metadata.get('base_features', 'unknown')}")
    print(f"Total features: {metadata.get('total_features', 'unknown')}")
    print(f"Class names: {metadata.get('class_names', [])}")

    # Preprocess data
    print(f"\n{'='*70}")
    print("PREPROCESSING DATA")
    print("="*70)

    try:
        features = csv_processor.preprocess_tess(df)
        print(f"[OK] Preprocessed features shape: {features.shape}")
        print(f"     Expected: ({len(df)}, 34)")

        if features.shape[1] != 34:
            print(f"[WARNING] Feature count mismatch! Expected 34, got {features.shape[1]}")
        else:
            print("[OK] Feature count matches expected (34 features)")

    except Exception as e:
        print(f"[ERROR] Preprocessing failed: {e}")
        import traceback
        traceback.print_exc()
        return

    # Make predictions
    print(f"\n{'='*70}")
    print("MAKING PREDICTIONS")
    print("="*70)

    try:
        predicted_classes, probabilities, class_names = model_loader.predict_ensemble(
            features, 'tess'
        )
        print(f"[OK] Predictions shape: {predicted_classes.shape}")
        print(f"[OK] Probabilities shape: {probabilities.shape}")
        print(f"[OK] Class names: {class_names}")
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        return

    # Convert predictions to class labels
    predicted_labels = [class_names[i] for i in predicted_classes]
    actual_labels = df['tfopwg_disp'].values

    # Calculate accuracy
    print(f"\n{'='*70}")
    print("ACCURACY RESULTS")
    print("="*70)

    accuracy = accuracy_score(actual_labels, predicted_labels)

    print(f"\nACCURACY ON FULL TRAINING DATA: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"\nExpected accuracy (from training):")
    print(f"  - Test set:      92.32%")
    print(f"  - 5-fold CV:     91.87%")
    print(f"\nActual accuracy:   {accuracy*100:.2f}%")

    # Determine success
    if accuracy >= 0.92:
        print("\n[SUCCESS] Accuracy matches expected performance (>=92%)")
        print("          New model is working correctly!")
    elif accuracy >= 0.87:
        print("\n[GOOD] Accuracy is high (>=87%) but slightly below expected")
        print("       This may be due to different train/test splits")
    elif accuracy >= 0.70:
        print("\n[WARNING] Accuracy is moderate (>=70%) - needs investigation")
    else:
        print("\n[FAILED] Accuracy is too low (<70%) - feature engineering may be broken")

    # Detailed classification report
    print(f"\n{'='*70}")
    print("DETAILED CLASSIFICATION REPORT")
    print("="*70)
    print(classification_report(actual_labels, predicted_labels))

    # Confusion matrix
    print(f"\n{'='*70}")
    print("CONFUSION MATRIX")
    print("="*70)
    cm = confusion_matrix(actual_labels, predicted_labels, labels=class_names)
    print("\nRows = Actual, Columns = Predicted")
    print(f"\n{'':>8}", end='')
    for cn in class_names:
        print(f"{cn:>8}", end='')
    print()
    for i, cn in enumerate(class_names):
        print(f"{cn:>8}", end='')
        for j in range(len(class_names)):
            print(f"{cm[i,j]:>8}", end='')
        print()

    # Prediction distribution
    print(f"\n{'='*70}")
    print("PREDICTION DISTRIBUTION")
    print("="*70)
    pred_df = pd.Series(predicted_labels)
    print(pred_df.value_counts().sort_index())

    print(f"\n{'='*70}")
    print("TEST COMPLETE")
    print("="*70)

if __name__ == "__main__":
    test_new_tess_model()
