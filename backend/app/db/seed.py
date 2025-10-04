from app.modules.ml.model_registry import ModelRegistry, TrainingJob
from sqlalchemy import select
from datetime import datetime

async def seed_models(db):
    models_to_seed = [
        {"model_name": "Kepler", "dataset_type": "Kepler", "version": "1.0", "path": ""},
        {"model_name": "TESS", "dataset_type": "TESS", "version": "1.0", "path": ""},
        {"model_name": "Unified", "dataset_type": "Mixed", "version": "1.0", "path": ""},
    ]

    for model_data in models_to_seed:
        # Check if model exists
        result = await db.execute(select(ModelRegistry).where(ModelRegistry.model_name == model_data["model_name"]))
        existing_model = result.scalars().first()

        if not existing_model:
            model = ModelRegistry(**model_data)
            db.add(model)
            await db.flush()  # Ensure model.id is available

            # Add a dummy initial training job
            dummy_job = TrainingJob(
                model_id=model.id,
                dataset_path="",
                metrics={"accuracy": 0.9, "confusion_matrix": [[5,1],[2,6]]},
                status="Completed",
                created_at=datetime.utcnow(),
                completed_at=datetime.utcnow()
            )
            db.add(dummy_job)

            # Update model last_trained_at
            model.last_trained_at = dummy_job.completed_at

    await db.commit()
