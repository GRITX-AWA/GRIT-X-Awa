import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "exoplanet_csvs")

# Validate required environment variables
_supabase_available = bool(SUPABASE_URL and SUPABASE_KEY)

if not _supabase_available:
    import warnings
    warnings.warn(
        "Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
        "environment variables to enable data persistence. Running in LOCAL MODE.",
        UserWarning
    )

def get_supabase():
    """
    Get Supabase client instance.

    Raises:
        ValueError: If Supabase credentials are not configured
    """
    if not _supabase_available:
        raise ValueError(
            "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
            "environment variables."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def is_supabase_available() -> bool:
    """Check if Supabase credentials are configured"""
    return _supabase_available

def upload_file_bytes(path_in_bucket: str, file_bytes: bytes):
    sb = get_supabase()
    return sb.storage.from_(BUCKET).upload(
        path_in_bucket, 
        file_bytes, 
        file_options={"content-type": "application/octet-stream", "upsert": "true"}
    )

def get_public_url(path_in_bucket: str):
    sb = get_supabase()
    return sb.storage.from_(BUCKET).get_public_url(path_in_bucket)

def insert_predictions(preds: list):
    sb = get_supabase()
    return sb.table("predictions").insert(preds).execute()

def insert_raw_rows(rows: list):
    sb = get_supabase()
    return sb.table("nasa_data").insert(rows).execute()

def insert_upload_log(log_data: dict):
    """
    Log a file upload event

    Args:
        log_data: dict with keys: filename, user_id, file_size, bucket_path, dataset_type
    """
    sb = get_supabase()
    return sb.table("upload_logs").insert(log_data).execute()

def insert_batch_predictions(predictions: list):
    """
    Insert multiple prediction results

    Args:
        predictions: list of dicts with prediction data
    """
    sb = get_supabase()
    return sb.table("predictions").insert(predictions).execute()

def get_predictions_by_job(job_id: str):
    """
    Retrieve predictions by job ID

    Args:
        job_id: unique identifier for the upload/prediction job
    """
    sb = get_supabase()
    return sb.table("predictions").select("*").eq("job_id", job_id).execute()

def get_recent_predictions(limit: int = 50):
    """
    Get recent predictions

    Args:
        limit: maximum number of predictions to return
    """
    sb = get_supabase()
    return sb.table("predictions").select("*").order("created_at", desc=True).limit(limit).execute()
