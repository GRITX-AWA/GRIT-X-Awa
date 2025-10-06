""
Operations for managing NASA data in the database.
"""
from typing import List, Dict, Any
from ...db.supabase_client import get_supabase

def insert_nasa_data(data: List[Dict[str, Any]]) -> bool:
    """
    Insert NASA data into the database.

    Args:
        data: List of NASA data records to insert
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not data:
        return False
        
    supabase = get_supabase()
    
    try:
        # Batch insert the data
        result = supabase.table('nasa_data').insert(data).execute()
        return hasattr(result, 'data') and bool(result.data)
    except Exception as e:
        print(f"Error inserting NASA data: {e}")
        return False

def get_nasa_data_by_mission(mission_id: str) -> List[Dict[str, Any]]:
    """
    Retrieve NASA data by mission ID.

    Args:
        mission_id: The mission ID to filter data by
        
    Returns:
        List of NASA data records
    """
    supabase = get_supabase()
    
    try:
        result = (
            supabase.table('nasa_data')
            .select('*')
            .eq('mission_id', mission_id)
            .execute()
        )
        
        if hasattr(result, 'data') and result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error fetching NASA data for mission {mission_id}: {e}")
        return []
