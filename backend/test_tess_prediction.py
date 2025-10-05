"""
Test TESS prediction accuracy with the newly trained models
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import accuracy_score, classification_report
import sys
sys.path.insert(0, str(Path(__file__).parent))

from app.services.csv_service import CSVProcessor
from app.services.model_loader import ModelLoader

def test_tess_accuracy():
    """Test prediction accuracy on training data"""

    # Load the training data
    data_path = Path("../csv/TOI_2025.10.05_11.28.40.csv")
    df = pd.read_csv(data_path, comment='#')

    print(f"Loaded {len(df)} rows")
    print(f"\nTarget column distribution:")
    print(df['tfopwg_disp'].value_counts())

    # Initialize processors
    csv_processor = CSVProcessor()
    model_loader = ModelLoader()

    # Preprocess data
    print("\n" + "="*60)
    print("PREPROCESSING DATA")
    print("="*60)

    try:
        features = csv_processor.preprocess_tess(df)
        print(f"Preprocessed features shape: {features.shape}")
    except Exception as e:
        print(f"ERROR during preprocessing: {e}")
        import traceback
        traceback.print_exc()
        return

    # Make predictions
    print("\n" + "="*60)
    print("MAKING PREDICTIONS")
    print("="*60)

    try:
        predicted_classes, probabilities, class_names = model_loader.predict_ensemble(
            features, 'tess'
        )
        print(f"Predictions shape: {predicted_classes.shape}")
        print(f"Class names: {class_names}")
    except Exception as e:
        print(f"ERROR during prediction: {e}")
        import traceback
        traceback.print_exc()
        return

    # Convert predictions to class labels
    predicted_labels = [class_names[i] for i in predicted_classes]

    # Calculate accuracy
    print("\n" + "="*60)
    print("ACCURACY RESULTS")
    print("="*60)

    actual_labels = df['tfopwg_disp'].values
    accuracy = accuracy_score(actual_labels, predicted_labels)

    print(f"\nACCURACY ON TRAINING DATA: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"\nExpected: ~86.6% (from training)")
    print(f"Actual:   {accuracy*100:.2f}%")

    if accuracy >= 0.85:
        print("\n[SUCCESS] Accuracy is within expected range (>85%)")
    elif accuracy >= 0.70:
        print("\n[WARNING] Accuracy is below expected but above old performance")
    else:
        print("\n[FAILED] Accuracy is still low (<70%)")

    print("\nDetailed Classification Report:")
    print(classification_report(actual_labels, predicted_labels))

    # Show confusion between predictions
    print("\nPrediction distribution:")
    pred_df = pd.Series(predicted_labels)
    print(pred_df.value_counts())

if __name__ == "__main__":
    test_tess_accuracy()
