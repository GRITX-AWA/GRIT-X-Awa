from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.db.supabase_client import get_recent_discoveries

router = APIRouter()

@router.get("/discoveries", response_model=List[dict], tags=["Discoveries"])
async def get_discoveries(limit: int = 10):
    """
    Get recent astronomical discoveries
    
    Args:
        limit: Maximum number of discoveries to return (default: 10, max: 100)
        
    Returns:
        List of recent discoveries with their details
    """
    if limit < 1 or limit > 100:
        limit = 10
        
    try:
        discoveries = get_recent_discoveries(limit=limit)
        return discoveries
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching discoveries: {str(e)}"
        )
