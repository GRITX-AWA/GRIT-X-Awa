from pydantic import BaseModel

class SpaceDataBase(BaseModel):
    kepid: int | None = None
    kepler_name: str | None = None
    koi_disposition: str | None = None
    koi_period: float | None = None
    koi_prad: float | None = None
    koi_sma: float | None = None
    koi_incl: float | None = None
    koi_teq: float | None = None
    koi_insol: float | None = None
    description: str | None = ""

class SpaceDataCreate(SpaceDataBase):
  pass

class SpaceData(SpaceDataBase):
  id: int

  class Config:
    orm_mode = True

class SpaceDataResponse(SpaceDataBase):
  id: int

  class Config:
    orm_mode = True

# class SpaceDataUpdate(BaseModel):
#     kepid: int | None = None
#     kepler_name: str | None = None
#     koi_disposition: str | None = None
#     koi_period: float | None = None
#     koi_prad: float | None = None
#     koi_sma: float | None = None
#     koi_incl: float | None = None
#     koi_teq: float | None = None
#     koi_insol: float | None = None
#     description: str | None = ""

# class SpaceDataDelete(BaseModel):
#     id: int
