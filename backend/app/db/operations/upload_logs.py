""
Operations for managing upload logs in the database.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from ...db.supabase_client import get_supabase

def insert_upload_log(log_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Insert an upload log entry into the database.

    Args:
        log_data: Dictionary containing log data
            Should include: filename, user_id, file_size, bucket_path, dataset_type
            
    Returns:
        The created log entry or None if failed
    """
    required_fields = ['filename', 'user_id', 'file_size', 'bucket_path', 'dataset_type']
    if not all(field in log_data for field in required_fields):
        raise ValueError(f"Missing required fields: {', '.join(required_fields)}")
    
    supabase = get_supabase()
    
    try:
        # Prepare the data for insertion
        data = {
            'filename': log_data['filename'],
            'user_id': log_data['user_id'],
            'file_size': log_data['file_size'],
            'bucket_path': log_data['bucket_path'],
            'dataset_type': log_data['dataset_type'],
            'status': log_data.get('status', 'completed'),
            'metadata': log_data.get('metadata', {})
        }
        
        # Insert the data
        result = supabase.table('upload_logs').insert(data).execute()
        
        if hasattr(result, 'data') and result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error inserting upload log: {e}")
        return None

def get_upload_logs(user_id: str = None, limit: int = 50) -> list:
    """
    Retrieve upload logs, optionally filtered by user ID.

    Args:
        user_id: Optional user ID to filter logs by
        limit: Maximum number of logs to return (default: 50)
        
    Returns:
        List of upload log records
    """
    supabase = get_supabase()
    
    try:
        query = supabase.table('upload_logs').select('*')
        
        if user_id:
            query = query.eq('user_id', user_id)
            
        result = query.order('created_at', desc=True).limit(limit).execute()
        
        if hasattr(result, 'data') and result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error fetching upload logs: {e}")
        return []
