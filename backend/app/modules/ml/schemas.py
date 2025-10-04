# app/modules/ml/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PredictRequest(BaseModel):
    dataset_type: str  # Kepler / TESS / Unified
    data: List[List[float]]  # Array of features

class PredictResponse(BaseModel):
    predicted_class: str
    confidence: float

class TrainRequest(BaseModel):
    dataset_type: str
    data: List[List[float]]
    labels: List[int]


class StatsResponse(BaseModel):
    model_name: str
    dataset_type: str
    version: str
    last_trained_at: Optional[str]
    last_accuracy: Optional[float]
    confusion_matrix: Optional[List[List[int]]]
    last_dataset_path: Optional[str]

# ===== New Schemas for Upload Feature =====

class UploadResponse(BaseModel):
    """Response after uploading a CSV file"""
    success: bool
    message: str
    job_id: str
    dataset_type: str
    file_url: str
    total_predictions: int
    predictions: List[Dict[str, Any]]

class UploadLogCreate(BaseModel):
    """Schema for logging file uploads"""
    filename: str
    user_id: Optional[str] = "anonymous"
    file_size: int
    bucket_path: str
    dataset_type: str

class PredictionResult(BaseModel):
    """Individual prediction result"""
    row_index: int
    predicted_class: str
    confidence: Dict[str, float]
    raw_probabilities: List[float]

class BatchPredictionResult(BaseModel):
    """Batch prediction results for multiple rows"""
    job_id: str
    dataset_type: str
    total_rows: int
    predictions: List[PredictionResult]
    class_names: List[str]

class PredictionJobResponse(BaseModel):
    """Response for retrieving predictions by job ID"""
    job_id: str
    dataset_type: str
    created_at: datetime
    predictions: List[Dict[str, Any]]
