from sqlalchemy import Column, Integer, String , Float
from app.db.database import Base

class SpaceData(Base):
  __tablename__ = 'space_data'
  id = Column(Integer, primary_key=True, index=True)
  kepid = Column(Integer, nullable=True)
  kepler_name = Column(String, nullable=True)
  koi_disposition = Column(String, nullable=True)
  koi_period = Column(Float, nullable=True)
  koi_prad = Column(Float, nullable=True)
  koi_sma = Column(Float, nullable=True)
  koi_incl = Column(Float, nullable=True)
  koi_teq = Column(Float, nullable=True)
  koi_insol = Column(Float, nullable=True)
  description = Column(String, default="")
