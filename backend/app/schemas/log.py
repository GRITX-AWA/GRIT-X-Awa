from pydantic import BaseModel, ConfigDict
from datetime import datetime

class LogCreate(BaseModel):
    message: str

class LogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    message: str
    created_at: datetime
