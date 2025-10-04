from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db, AsyncSessionLocal
from app.models.log import Log
from app.schemas.log import LogCreate, LogResponse

router = APIRouter(prefix="/api/v1/logs", tags=["logs"])

# Helper function to insert logs easily
async def insert_log(message: str) -> int:
    """
    Helper function to insert a log message into the database.
    Returns the log ID.
    
    Usage:
        log_id = await insert_log("Your message here")
    """
    async with AsyncSessionLocal() as db:
        new_log = Log(message=message)
        db.add(new_log)
        await db.commit()
        await db.refresh(new_log)
        return new_log.id

@router.post("/", response_model=LogResponse)
async def create_log(log_data: LogCreate, db: AsyncSession = Depends(get_db)):
    """
    Insert a new log entry into the log table
    """
    new_log = Log(message=log_data.message)
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

@router.get("/hello")
async def hello_world():
    """
    Inserts 'hello world' into database and returns all logs
    """
    # Insert hello world
    await insert_log("hello world")
    
    # Get all logs
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Log).order_by(Log.created_at.desc()))
        logs = result.scalars().all()
        return {"message": "hello world inserted", "logs": [{"id": log.id, "message": log.message, "created_at": str(log.created_at)} for log in logs]}

@router.get("/demo")
async def demo_logs():
    """
    Demo endpoint showing how to use insert_log() with if/else conditions
    """
    # Example: Generate multiple logs based on conditions
    value = 42
    
    if value > 50:
        log_id = await insert_log("Value is greater than 50")
    elif value > 30:
        log_id = await insert_log("Value is between 30 and 50")
    else:
        log_id = await insert_log("Value is less than or equal to 30")
    
    # You can also insert multiple logs in sequence
    await insert_log("First log entry")
    await insert_log("Second log entry")
    final_log_id = await insert_log("Third log entry")
    
    return {
        "message": "Demo completed",
        "condition_log_id": log_id,
        "final_log_id": final_log_id
    }

@router.get("/all", response_model=list[LogResponse])
async def get_all_logs(db: AsyncSession = Depends(get_db)):
    """
    Get latest 7 logs from the database
    """
    result = await db.execute(select(Log).order_by(Log.created_at.desc()).limit(7))
    logs = result.scalars().all()
    return logs

@router.get("/recent", response_model=list[LogResponse])
async def get_recent_logs(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    Get recent logs from the database
    
    Args:
        limit: Number of logs to retrieve (default: 10)
    """
    result = await db.execute(
        select(Log).order_by(Log.created_at.desc()).limit(limit)
    )
    logs = result.scalars().all()
    return logs

@router.get("/{log_id}", response_model=LogResponse)
async def get_log_by_id(log_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific log by ID
    """
    result = await db.execute(select(Log).where(Log.id == log_id))
    log = result.scalar_one_or_none()
    
    if not log:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Log not found")
    
    return log
