"""
Test TESS Feature Engineering
Verify that feature engineering produces the correct number of features
"""

import pandas as pd
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.tess_feature_engineering import TessFeatureEngineer

# Load sample CSV
csv_path = Path("../csv/original_features.csv")
if not csv_path.exists():
    csv_path = Path("csv/original_features.csv")

print(f"Loading CSV from: {csv_path}")
df = pd.read_csv(csv_path)

print(f"\nOriginal CSV shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Apply feature engineering
engineer = TessFeatureEngineer()

try:
    df_engineered = engineer.engineer_features(df)

    print(f"\n✓ Feature engineering successful!")
    print(f"Engineered features shape: {df_engineered.shape}")
    print(f"Number of features: {df_engineered.shape[1]}")
    print(f"\nFirst few engineered column names:")
    for i, col in enumerate(df_engineered.columns[:20]):
        print(f"  {i+1}. {col}")

    if df_engineered.shape[1] == 67:
        print(f"\n✓✓✓ SUCCESS: Generated exactly 67 features (matches imputer)")
    else:
        print(f"\n⚠ WARNING: Generated {df_engineered.shape[1]} features, but imputer expects 67")
        print(f"  Difference: {67 - df_engineered.shape[1]}")

except Exception as e:
    print(f"\n✗ Feature engineering failed:")
    print(f"  Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
