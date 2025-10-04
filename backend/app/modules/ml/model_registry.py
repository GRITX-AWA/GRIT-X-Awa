# app/modules/ml/model_registry.py
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class ModelRegistry(Base):
    __tablename__ = "model_registry"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, unique=True, nullable=False)
    dataset_type = Column(String, nullable=False)  # Kepler / TESS / Unified
    version = Column(String, nullable=False)
    path = Column(String, nullable=False)  # File path to model
    created_at = Column(DateTime, default=datetime.utcnow)
    last_trained_at = Column(DateTime, nullable=True)

    # Relationships
    training_jobs = relationship("TrainingJob", back_populates="model")
    predictions = relationship("PredictionLog", back_populates="model")


class TrainingJob(Base):
    __tablename__ = "training_job"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("model_registry.id"), nullable=False)
    dataset_path = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)  # store accuracy, confusion matrix, etc.
    status = Column(String, nullable=False)  # Pending / Running / Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    model = relationship("ModelRegistry", back_populates="training_jobs")


class PredictionLog(Base):
    __tablename__ = "prediction_log"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("model_registry.id"), nullable=False)
    dataset_type = Column(String, nullable=False)
    predicted_class = Column(String, nullable=False)
    confidence = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    model = relationship("ModelRegistry", back_populates="predictions")
