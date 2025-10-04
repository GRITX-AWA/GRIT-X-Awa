from sqlalchemy import Column, BigInteger, Text, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Log(Base):
    __tablename__ = "log"
    
    id = Column(BigInteger, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
