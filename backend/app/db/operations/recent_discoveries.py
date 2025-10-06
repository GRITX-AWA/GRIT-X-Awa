""
Operations for managing recent discoveries in the database.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from ...db.supabase_client import get_supabase

def get_recent_discoveries(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieve recent discoveries from the database.

    Args:
        limit: Maximum number of discoveries to return (default: 10)
        
    Returns:
        List of recent discovery records
    """
    supabase = get_supabase()
    
    try:
        result = (
            supabase.table('recent_discoveries')
            .select('*')
            .order('created_at', desc=True)
            .limit(limit)
            .execute()
        )
        
        if hasattr(result, 'data') and result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error fetching recent discoveries: {e}")
        return []

def add_discovery(discovery_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Add a new discovery to the database.

    Args:
        discovery_data: Dictionary containing discovery data
            Should include: object_name, object_type, confidence, metadata (optional)
            
    Returns:
        The created discovery record or None if failed
    """
    if not all(key in discovery_data for key in ['object_name', 'object_type', 'confidence']):
        raise ValueError("Missing required fields: object_name, object_type, confidence")
    
    supabase = get_supabase()
    
    try:
        # Prepare the data for insertion
        data = {
            'object': discovery_data['object_name'],
            'Type': discovery_data['object_type'],
            'Confidence': float(discovery_data['confidence']),
            'Date': discovery_data.get('date', datetime.utcnow().isoformat()),
            'metadata': discovery_data.get('metadata', {})
        }
        
        # Insert the data
        result = supabase.table('recent_discoveries').insert(data).execute()
        
        if hasattr(result, 'data') and result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error adding discovery: {e}")
        return None
