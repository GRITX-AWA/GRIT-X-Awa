#!/usr/bin/env python3
"""
CSV Validator and Fixer for GRIT-X-Awa Exoplanet Prediction System

Usage:
    python validate_csv.py input.csv [--fix] [--output fixed.csv]

This script:
1. Validates that your CSV has the required columns
2. Checks for proper formatting of categorical values
3. Optionally fixes common issues
4. Creates a clean CSV ready for upload
"""

import sys
import pandas as pd
import argparse
from pathlib import Path


# Required columns for each dataset type
KEPLER_REQUIRED = [
    'koi_pdisposition', 'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss',
    'koi_fpflag_co', 'koi_fpflag_ec', 'koi_period', 'koi_impact',
    'koi_duration', 'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol',
    'koi_model_snr', 'koi_tce_plnt_num', 'koi_steff', 'koi_slogg',
    'koi_srad', 'ra', 'dec', 'koi_kepmag'
]

TESS_REQUIRED = [
    'ra', 'dec', 'st_teff', 'st_logg', 'st_rad', 'st_dist',
    'st_pmra', 'st_pmdec', 'st_tmag', 'pl_orbper', 'pl_rade',
    'pl_trandep', 'pl_trandurh', 'pl_eqt', 'pl_insol'
]

VALID_KEPLER_DISPOSITIONS = ['CANDIDATE', 'CONFIRMED', 'FALSE POSITIVE']


def validate_csv(file_path):
    """Validate CSV and return issues found"""
    print(f"📋 Validating: {file_path}")
    print("=" * 60)

    issues = []
    warnings = []

    try:
        # Try reading with different encodings
        try:
            df = pd.read_csv(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, encoding='latin-1')
            warnings.append("⚠️  File encoding is not UTF-8. Will save as UTF-8.")

        print(f"✅ File loaded successfully")
        print(f"   Rows: {len(df)}")
        print(f"   Columns: {len(df.columns)}")
        print()

        # Check which dataset type
        kepler_matches = sum(1 for col in KEPLER_REQUIRED if col in df.columns)
        tess_matches = sum(1 for col in TESS_REQUIRED if col in df.columns)

        print(f"🔍 Dataset Type Detection:")
        print(f"   Kepler columns found: {kepler_matches}/{len(KEPLER_REQUIRED)}")
        print(f"   TESS columns found: {tess_matches}/{len(TESS_REQUIRED)}")
        print()

        if kepler_matches >= 10 and kepler_matches > tess_matches:
            dataset_type = 'kepler'
            required_cols = KEPLER_REQUIRED
            print(f"✅ Detected as: KEPLER dataset")
        elif tess_matches >= 10 and tess_matches > kepler_matches:
            dataset_type = 'tess'
            required_cols = TESS_REQUIRED
            print(f"✅ Detected as: TESS dataset")
        elif kepler_matches < 10 and tess_matches < 10:
            issues.append(
                f"❌ Not enough matching columns for either dataset type\n"
                f"   Need at least 10 matching columns\n"
                f"   Kepler: {kepler_matches}/21, TESS: {tess_matches}/15"
            )
            return issues, warnings, None, None
        else:
            issues.append("❌ Ambiguous dataset type - equal matches for Kepler and TESS")
            return issues, warnings, None, None

        print()

        # Check for missing required columns
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            issues.append(f"❌ Missing required columns: {', '.join(missing_cols)}")

        # Check for extra columns (just info, not an error)
        extra_cols = [col for col in df.columns if col not in required_cols]
        if extra_cols:
            warnings.append(f"ℹ️  Extra columns (will be ignored): {', '.join(extra_cols[:5])}")
            if len(extra_cols) > 5:
                warnings.append(f"   ... and {len(extra_cols) - 5} more")

        # Kepler-specific validation
        if dataset_type == 'kepler' and 'koi_pdisposition' in df.columns:
            unique_values = df['koi_pdisposition'].dropna().unique()
            invalid_values = [v for v in unique_values if v not in VALID_KEPLER_DISPOSITIONS]

            if invalid_values:
                issues.append(
                    f"❌ Invalid values in 'koi_pdisposition': {invalid_values}\n"
                    f"   Valid values: {VALID_KEPLER_DISPOSITIONS}"
                )
            else:
                print(f"✅ All koi_pdisposition values are valid")
                print(f"   Found: {list(unique_values)}")

        # Check for completely empty columns
        empty_cols = [col for col in required_cols if col in df.columns and df[col].isna().all()]
        if empty_cols:
            warnings.append(f"⚠️  Columns with all NaN values: {', '.join(empty_cols)}")

        # Check data types
        print()
        print("📊 Data Types Check:")
        for col in required_cols:
            if col in df.columns:
                non_null = df[col].dropna()
                if len(non_null) > 0:
                    if col == 'koi_pdisposition':
                        print(f"   {col}: {df[col].dtype} (categorical)")
                    else:
                        print(f"   {col}: {df[col].dtype}")

        return issues, warnings, df, dataset_type

    except Exception as e:
        issues.append(f"❌ Error reading file: {str(e)}")
        return issues, warnings, None, None


def fix_csv(df, dataset_type):
    """Fix common issues in the CSV"""
    print()
    print("🔧 Applying Fixes...")
    print("=" * 60)

    fixed_df = df.copy()

    # Fix Kepler disposition values
    if dataset_type == 'kepler' and 'koi_pdisposition' in fixed_df.columns:
        # Strip whitespace
        fixed_df['koi_pdisposition'] = fixed_df['koi_pdisposition'].str.strip()

        # Fix common variations
        replacements = {
            'FALSEPOSITIVE': 'FALSE POSITIVE',
            'FALSE_POSITIVE': 'FALSE POSITIVE',
            'FP': 'FALSE POSITIVE',
            'Confirmed': 'CONFIRMED',
            'confirmed': 'CONFIRMED',
            'Candidate': 'CANDIDATE',
            'candidate': 'CANDIDATE',
        }

        for old, new in replacements.items():
            if old in fixed_df['koi_pdisposition'].values:
                fixed_df['koi_pdisposition'] = fixed_df['koi_pdisposition'].replace(old, new)
                print(f"   ✓ Replaced '{old}' → '{new}'")

    # Keep only required columns (in order)
    required_cols = KEPLER_REQUIRED if dataset_type == 'kepler' else TESS_REQUIRED
    available_cols = [col for col in required_cols if col in fixed_df.columns]
    fixed_df = fixed_df[available_cols]

    print(f"   ✓ Kept {len(available_cols)} required columns")
    print(f"   ✓ Removed {len(df.columns) - len(available_cols)} extra columns")

    return fixed_df


def main():
    parser = argparse.ArgumentParser(
        description='Validate and fix CSV files for GRIT-X-Awa exoplanet predictions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python validate_csv.py data.csv                    # Just validate
  python validate_csv.py data.csv --fix              # Validate and fix
  python validate_csv.py data.csv --fix -o clean.csv # Fix and save to specific file
        """
    )
    parser.add_argument('input', help='Input CSV file to validate')
    parser.add_argument('--fix', action='store_true', help='Attempt to fix issues')
    parser.add_argument('-o', '--output', help='Output file for fixed CSV (default: input_fixed.csv)')

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ File not found: {args.input}")
        sys.exit(1)

    # Validate
    issues, warnings, df, dataset_type = validate_csv(args.input)

    # Print warnings
    if warnings:
        print()
        print("⚠️  Warnings:")
        for warning in warnings:
            print(f"   {warning}")

    # Print issues
    if issues:
        print()
        print("❌ Issues Found:")
        for issue in issues:
            print(f"   {issue}")
        print()

        if not args.fix:
            print("💡 Run with --fix to attempt automatic fixes")
            sys.exit(1)
    else:
        print()
        print("✅ No issues found! CSV is ready for upload.")

    # Fix if requested
    if args.fix and df is not None:
        fixed_df = fix_csv(df, dataset_type)

        # Determine output path
        if args.output:
            output_path = Path(args.output)
        else:
            output_path = input_path.parent / f"{input_path.stem}_fixed.csv"

        # Save
        fixed_df.to_csv(output_path, index=False, encoding='utf-8')
        print()
        print(f"💾 Fixed CSV saved to: {output_path}")
        print()

        # Re-validate
        print("🔄 Validating fixed file...")
        print("=" * 60)
        issues2, warnings2, _, _ = validate_csv(output_path)

        if not issues2:
            print()
            print("✅ SUCCESS! Fixed CSV is ready for upload!")
            print(f"📁 Upload this file: {output_path}")
        else:
            print()
            print("⚠️  Some issues could not be fixed automatically:")
            for issue in issues2:
                print(f"   {issue}")


if __name__ == '__main__':
    main()
