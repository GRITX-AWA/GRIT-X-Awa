import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "nasa-csv")

# Validate required environment variables
_supabase_available = bool(SUPABASE_URL and SUPABASE_KEY)

if not _supabase_available:
    import warnings
    warnings.warn(
        "Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
        "environment variables to enable data persistence. Running in LOCAL MODE.",
        UserWarning
    )

# Global Supabase client instance
_supabase_client = None

def get_supabase():
    """
    Get or create a Supabase client instance with connection pooling.
    
    Returns:
        supabase.Client: Configured Supabase client instance
        
    Raises:
        ValueError: If Supabase credentials are not properly configured
    """
    global _supabase_client
    
    if _supabase_client is None:
        if not _supabase_available:
            raise ValueError(
                "Supabase is not configured. Please set SUPABASE_URL and "
                "SUPABASE_SERVICE_ROLE_KEY environment variables in your .env file."
            )
            
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            # Test the connection with a simple query
            _supabase_client.table('recent_discoveries').select('*', count='exact').limit(1).execute()
            print("✅ Successfully connected to Supabase")
        except Exception as e:
            _supabase_client = None
            print(f"❌ Failed to connect to Supabase: {str(e)}")
            raise
            
    return _supabase_client

def get_recent_discoveries(limit: int = 10):
    """
    Get recent discoveries from the database

    Args:
        limit: maximum number of discoveries to return (default: 10)
        
    Returns:
        List of recent discoveries with fields: id, object, Type, Confidence, Date
    """
    if not _supabase_available:
        print("Supabase not available. Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
        return []
    
    try:
        supabase = get_supabase()
        
        # Query the recent_discoveries table
        response = supabase.table('recent_discoveries')\
                         .select('*')\
                         .order('Date', desc=True)\
                         .limit(limit)\
                         .execute()
        
        if hasattr(response, 'data'):
            return response.data or []
        return []
        
    except Exception as e:
        error_msg = f"Error fetching recent discoveries: {str(e)}"
        if hasattr(e, 'message'):
            error_msg += f"\nMessage: {e.message}"
        if hasattr(e, 'details'):
            error_msg += f"\nDetails: {e.details}"
        print(error_msg)
        return []

def insert_predictions(preds: list):
    sb = get_supabase()
    return sb.table("predictions").insert(preds).execute()

def insert_nasa_data(rows: list):
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
