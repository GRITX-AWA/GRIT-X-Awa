# app/api/v1/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import uuid
from app.db import supabase_client as sb
from app.services.csv_service import get_csv_processor
from app.services.model_loader import get_model_loader
from app.modules.ml.schemas import UploadResponse, UploadLogCreate

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


@router.post("/csv", response_model=UploadResponse)
async def upload_csv_file(file: UploadFile = File(...)):
    """
    Upload a CSV file, run ML predictions, and save results to Supabase

    Flow:
    1. Upload CSV to Supabase bucket
    2. Log the upload event
    3. Parse and detect dataset type (Kepler/TESS)
    4. Preprocess data
    5. Run ensemble predictions
    6. Save predictions to Supabase
    7. Return results with job ID

    Args:
        file: CSV file upload

    Returns:
        UploadResponse with job_id, predictions, and metadata
    """
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        # Read file content
        file_content = await file.read()
        file_size = len(file_content)

        # Create bucket path with timestamp to avoid conflicts
        bucket_path = f"uploads/{timestamp.split('T')[0]}/{job_id}_{file.filename}"

        # 1. Upload to Supabase bucket
        try:
            sb.upload_file_bytes(bucket_path, file_content)
            file_url = sb.get_public_url(bucket_path)
        except Exception as e:
            print(f"Warning: Failed to upload file to Supabase: {str(e)}")
            file_url = f"local://{bucket_path}"  # Fallback for local dev

        # 2. Process CSV
        csv_processor = get_csv_processor()
        try:
            dataset_type, features, original_df = csv_processor.process_csv_file(file_content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"CSV processing error: {str(e)}")

        # 3. Log upload event
        upload_log = UploadLogCreate(
            filename=file.filename,
            file_size=file_size,
            bucket_path=bucket_path,
            dataset_type=dataset_type
        )
        try:
            sb.insert_upload_log({
                **upload_log.model_dump(),
                "upload_timestamp": timestamp,
                "job_id": job_id
            })
        except Exception as e:
            print(f"Warning: Failed to log upload: {str(e)}")
            # Don't fail the request if logging fails

        # 4. Run predictions
        model_loader = get_model_loader()
        try:
            predicted_classes, probabilities, class_names = model_loader.predict_ensemble(
                features, dataset_type
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

        # 5. Prepare prediction results
        predictions_list = []
        for idx, (pred_class, proba) in enumerate(zip(predicted_classes, probabilities)):
            # Build confidence dict
            confidence_dict = {
                class_names[i]: float(proba[i]) for i in range(len(class_names))
            }

            prediction_record = {
                "job_id": job_id,
                "row_index": idx,
                "dataset_type": dataset_type,
                "predicted_class": class_names[pred_class],
                "confidence": confidence_dict,
                "created_at": timestamp
            }
            predictions_list.append(prediction_record)

        # 6. Save predictions to Supabase
        try:
            sb.insert_batch_predictions(predictions_list)
        except Exception as e:
            print(f"Warning: Failed to save predictions to Supabase: {str(e)}")
            # Still return results even if saving fails

        # 7. Return response
        return UploadResponse(
            success=True,
            message=f"Successfully processed {len(predictions_list)} predictions",
            job_id=job_id,
            dataset_type=dataset_type,
            file_url=file_url,
            total_predictions=len(predictions_list),
            predictions=predictions_list
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
