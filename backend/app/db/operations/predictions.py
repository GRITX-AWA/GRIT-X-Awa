""
Operations for managing predictions in the database.
"""
from typing import List, Dict, Any, Optional
from ...db.supabase_client import get_supabase

def insert_predictions(predictions: List[Dict[str, Any]]) -> bool:
    """
    Insert multiple predictions into the database.

    Args:
        predictions: List of prediction dictionaries
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not predictions:
        return False
        
    supabase = get_supabase()
    
    try:
        result = supabase.table('predictions').insert(predictions).execute()
        return hasattr(result, 'data') and bool(result.data)
    except Exception as e:
        print(f"Error inserting predictions: {e}")
        return False

def get_predictions_by_job(job_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve predictions by job ID.

    Args:
        job_id: The job ID to filter predictions by
        
    Returns:
        List of prediction records
    """
    supabase = get_supabase()
    
    try:
        result = (
            supabase.table('predictions')
            .select('*')
            .eq('job_id', job_id)
            .execute()
        )
        
        if hasattr(result, 'data') and result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error fetching predictions for job {job_id}: {e}")
        return []

def get_recent_predictions(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieve recent predictions.

    Args:
        limit: Maximum number of predictions to return (default: 50)
        
    Returns:
        List of recent prediction records
    """
    supabase = get_supabase()
    
    try:
        result = (
            supabase.table('predictions')
            .select('*')
            .order('created_at', desc=True)
            .limit(limit)
            .execute()
        )
        
        if hasattr(result, 'data') and result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error fetching recent predictions: {e}")
        return []
