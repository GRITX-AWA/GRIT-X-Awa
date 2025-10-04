# app/modules/ml/services.py
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.ml.model_registry import ModelRegistry, TrainingJob

from app.modules.ml.model_registry import ModelRegistry, TrainingJob, PredictionLog

# ----- Model selection -----
async def select_model(dataset_type: str, db: AsyncSession):
    result = await db.execute(select(ModelRegistry))
    models = result.scalars().all()

    dataset_type = dataset_type.lower()
    if dataset_type == "kepler":
        model = next((m for m in models if m.model_name.lower() == "kepler"), None)
    elif dataset_type == "tess":
        model = next((m for m in models if m.model_name.lower() == "tess"), None)
    else:  # "mixed" or "unified"
        model = next((m for m in models if m.model_name.lower() == "unified"), None)

    return model

# ----- Training -----

# Dummy training function (replace with your real ML training logic)
async def train_model(dataset_type: str, data: list[list[float]], labels: list[int], db: AsyncSession):
    # Select the correct model
    model_name_map = {
        "Kepler": "Kepler",
        "TESS": "TESS",
        "Unified": "Unified"
    }
    model_name = model_name_map.get(dataset_type, "Unified")

    result = await db.execute(select(ModelRegistry).where(ModelRegistry.model_name == model_name))
    model = result.scalars().first()
    if not model:
        raise ValueError(f"Model '{model_name}' not found in registry.")

    # --- ML Training logic placeholder ---
    # Simulate training: compute metrics
    accuracy = 0.95  # Replace with actual computed accuracy
    confusion_matrix = [[10,2],[1,12]]  # Replace with actual confusion matrix
    # --------------------------------------

    # Create a new TrainingJob
    job = TrainingJob(
        model_id=model.id,
        dataset_path="",  # Optional: path to the uploaded dataset
        metrics={"accuracy": accuracy, "confusion_matrix": confusion_matrix},
        status="Completed",
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )
    db.add(job)

    # Update model's last_trained_at
    model.last_trained_at = job.completed_at

    await db.commit()
    await db.refresh(model)

    return {
        "model_name": model.model_name,
        "version": model.version,
        "last_trained_at": model.last_trained_at,
        "metrics": job.metrics
    }

# ----- Prediction -----

# Example placeholder for actual ML model prediction
async def predict_model(dataset_type: str, data: list[list[float]], db: AsyncSession):
    # --- Select the model ---
    result = await db.execute(
        select(ModelRegistry).where(
            ModelRegistry.dataset_type == dataset_type
        )
    )
    model = result.scalars().first()
    if not model:
        raise ValueError(f"No model found for dataset type {dataset_type}")

    # --- Perform ML prediction (placeholder logic) ---
    # Replace this with actual model inference
    predicted_class = "ClassA"
    confidence = {"ClassA": 0.85, "ClassB": 0.15}

    # --- Log prediction ---
    prediction_log = PredictionLog(
        model_id=model.id,
        dataset_type=dataset_type,
        predicted_class=predicted_class,
        confidence=confidence,
        timestamp=datetime.utcnow()
    )
    db.add(prediction_log)
    await db.commit()
    await db.refresh(prediction_log)

    # Return response
    return {
        "model_name": model.model_name,
        "predicted_class": predicted_class,
        "confidence": confidence
    }

# ----- Stats -----

async def get_available_models(db: AsyncSession):
    """Get all available models from the registry"""
    result = await db.execute(select(ModelRegistry))
    models = result.scalars().all()
    
    available_models = []
    for model in models:
        available_models.append({
            "id": model.id,
            "name": model.model_name,
            "dataset_type": model.dataset_type,
            "version": model.version,
            "last_trained_at": model.last_trained_at,
            "description": getattr(model, 'description', f'Model for {model.dataset_type} dataset'),
            "status": "active"
        })
    
    return available_models

async def get_model_stats(db: AsyncSession):
    # Load models with related training jobs
    result = await db.execute(
        select(ModelRegistry)
        .options(selectinload(ModelRegistry.training_jobs))
    )
    models = result.scalars().all()

    stats = []
    for model in models:
        # Sort training jobs by completed_at descending
        jobs = sorted(
            model.training_jobs,
            key=lambda x: x.completed_at or datetime.min,
            reverse=True
        )

        training_history = []
        for job in jobs:
            training_history.append({
                "dataset_path": job.dataset_path,
                "accuracy": job.metrics.get("accuracy") if job.metrics else None,
                "confusion_matrix": job.metrics.get("confusion_matrix") if job.metrics else None,
                "status": job.status,
                "created_at": job.created_at,
                "completed_at": job.completed_at
            })

        stats.append({
            "model_name": model.model_name,
            "dataset_type": model.dataset_type,
            "version": model.version,
            "last_trained_at": model.last_trained_at,
            "training_history": training_history
        })

    return stats
