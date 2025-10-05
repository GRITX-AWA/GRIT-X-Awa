#!/usr/bin/env python3
"""
Script to download datasets from Supabase bucket and convert to JSON
"""
import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd
import json

# Load environment variables
load_dotenv()

# Extract Supabase project URL from the connection string
# Format: https://[project-ref].supabase.co
SUPABASE_PROJECT_REF = "nafpqdeyshrdstecqldc"  # Extracted from your connection string
SUPABASE_URL = f"https://{SUPABASE_PROJECT_REF}.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Changed from SUPABASE_SERVICE_ROLE_KEY
BUCKET = os.getenv("SUPABASE_BUCKET", "exoplanet_csvs")  # Use bucket from .env

print(f"Using Supabase URL: {SUPABASE_URL}")
print(f"Using bucket: {BUCKET}")

def download_and_convert():
    """Download CSV files and convert to JSON"""

    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    files_to_process = ['kepler.csv', 'tess.csv']

    for filename in files_to_process:
        print(f"\n>> Processing {filename}...")

        try:
            # Download file from Supabase (files are in the datasets/ folder)
            file_path = f"datasets/{filename}"
            file_data = supabase.storage.from_(BUCKET).download(file_path)

            # Save CSV temporarily
            temp_csv_path = f"temp_{filename}"
            with open(temp_csv_path, 'wb') as f:
                f.write(file_data)

            # Read CSV with pandas
            df = pd.read_csv(temp_csv_path, comment='#')

            print(f"   [OK] Loaded {len(df)} rows, {len(df.columns)} columns")

            # Convert to dict first, then clean NaN values manually
            json_data = df.to_dict('records')

            # Replace NaN, inf, and -inf with None
            import numpy as np
            import math

            def clean_value(val):
                if pd.isna(val) or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
                    return None
                return val

            # Clean all values in the data
            json_data = [
                {k: clean_value(v) for k, v in record.items()}
                for record in json_data
            ]

            print(f"   [OK] Cleaned NaN/inf values")

            # Save JSON to frontend data directory
            dataset_name = filename.replace('.csv', '')
            output_dir = '../frontend/src/data'
            os.makedirs(output_dir, exist_ok=True)

            # Save full dataset (for backward compatibility)
            output_path = os.path.join(output_dir, f'{dataset_name}.json')
            with open(output_path, 'w') as f:
                json.dump(json_data, f, indent=2)

            print(f"   [OK] Saved full dataset to {output_path}")

            # Create chunked versions for better performance
            chunk_size = 1000
            chunks_dir = os.path.join(output_dir, f'{dataset_name}_chunks')
            os.makedirs(chunks_dir, exist_ok=True)

            total_chunks = (len(json_data) + chunk_size - 1) // chunk_size

            for i in range(0, len(json_data), chunk_size):
                chunk = json_data[i:i + chunk_size]
                chunk_num = i // chunk_size
                chunk_path = os.path.join(chunks_dir, f'chunk_{chunk_num}.json')

                with open(chunk_path, 'w') as f:
                    json.dump(chunk, f, indent=2)

            # Create metadata file
            metadata = {
                'total_rows': len(json_data),
                'chunk_size': chunk_size,
                'total_chunks': total_chunks,
                'columns': list(df.columns)
            }

            metadata_path = os.path.join(chunks_dir, 'metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)

            print(f"   [OK] Created {total_chunks} chunks in {chunks_dir}")

            # Upload chunks to Supabase bucket
            print(f"   [UPLOAD] Uploading chunks to Supabase bucket...")
            try:
                # Upload metadata
                with open(metadata_path, 'rb') as f:
                    supabase.storage.from_(BUCKET).upload(
                        f"{dataset_name}_chunks/metadata.json",
                        f.read(),
                        file_options={"content-type": "application/json", "upsert": "true"}
                    )

                # Upload each chunk
                for i in range(total_chunks):
                    chunk_file = os.path.join(chunks_dir, f'chunk_{i}.json')
                    with open(chunk_file, 'rb') as f:
                        supabase.storage.from_(BUCKET).upload(
                            f"{dataset_name}_chunks/chunk_{i}.json",
                            f.read(),
                            file_options={"content-type": "application/json", "upsert": "true"}
                        )

                print(f"   [OK] Uploaded {total_chunks} chunks + metadata to Supabase")
            except Exception as upload_err:
                print(f"   [WARNING] Failed to upload to Supabase: {str(upload_err)}")
                print(f"   [INFO] Local files still available in {chunks_dir}")

            # Clean up temp file
            os.remove(temp_csv_path)

            # Print sample data
            print(f"   Sample columns: {list(df.columns)[:5]}")

        except Exception as e:
            print(f"   [ERROR] Error processing {filename}: {str(e)}")

    print("\n[DONE] Conversion complete!")

if __name__ == "__main__":
    download_and_convert()
