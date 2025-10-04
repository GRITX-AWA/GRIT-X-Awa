from app.db.database import engine, Base
# Import all models so they are registered with Base
from app.models.log import Log
from app.models.dataset import SpaceData
from app.modules.ml.model_registry import ModelRegistry, TrainingJob

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
