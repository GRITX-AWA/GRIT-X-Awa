# app/api/v1/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import supabase_client as sb
from app.db.database import get_db
from app.services.csv_service import get_csv_processor
from app.services.model_loader import get_model_loader
from app.services.validation_service import get_validation_service
from app.modules.ml.schemas import UploadResponse, UploadLogCreate
from app.models.exoplanet import AnalyzedExoplanet

router = APIRouter(prefix="/api/v1/upload", tags=["upload"])


@router.post("/csv", response_model=UploadResponse)
async def upload_csv_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
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
            if sb.is_supabase_available():
                sb.upload_file_bytes(bucket_path, file_content)
                file_url = sb.get_public_url(bucket_path)
            else:
                print(f"⚠️  Supabase not configured - skipping file upload")
                file_url = f"local://{bucket_path}"  # Fallback for local dev
        except Exception as e:
            print(f"⚠️  Warning: Failed to upload file to Supabase: {str(e)}")
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
            if sb.is_supabase_available():
                sb.insert_upload_log({
                    **upload_log.model_dump(),
                    "upload_timestamp": timestamp,
                    "job_id": job_id
                })
            else:
                print(f"⚠️  Supabase not configured - skipping upload log")
        except Exception as e:
            print(f"⚠️  Warning: Failed to log upload: {str(e)}")
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
            if sb.is_supabase_available():
                sb.insert_batch_predictions(predictions_list)
                print(f"✅ Saved {len(predictions_list)} predictions to Supabase")
            else:
                print(f"⚠️  Supabase not configured - predictions not persisted to database")
        except Exception as e:
            print(f"⚠️  Warning: Failed to save predictions to Supabase: {str(e)}")
            # Still return results even if saving fails

        # 7. Save analyzed exoplanets to database for tracking and validation
        try:
            # Define valid fields for AnalyzedExoplanet model
            valid_fields = {
                'kepid', 'kepler_name', 'koi_disposition', 'koi_pdisposition',
                'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co',
                'koi_fpflag_ec', 'koi_period', 'koi_impact', 'koi_duration',
                'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol', 'koi_model_snr',
                'koi_tce_plnt_num', 'koi_steff', 'koi_slogg', 'koi_srad', 'koi_kepmag',
                'toi', 'tid', 'tfopwg_disp', 'rastr', 'decstr', 'pl_orbper',
                'pl_rade', 'pl_trandep', 'pl_trandurh', 'pl_eqt', 'pl_insol',
                'st_rad', 'st_teff', 'st_logg', 'st_dist', 'st_pmra', 'st_pmdec',
                'st_tmag', 'toi_created', 'rowupdate', 'ra', 'dec'
            }
            
            # Field name mappings for variations in CSV column names
            field_mappings = {
                'kepoi_name': 'kepler_name',
                'tic_id': 'tid',
                'toi_id': 'toi',
            }
            
            for idx, (pred_class, proba) in enumerate(zip(predicted_classes, probabilities)):
                # Get max confidence
                max_confidence = float(max(proba))

                # Create exoplanet record with all original data
                exoplanet_data = {
                    'job_id': job_id,
                    'row_index': idx,
                    'dataset_type': dataset_type,
                    'predicted_class': class_names[pred_class],
                    'confidence_score': max_confidence,
                }

                # Add original data from CSV (only valid fields)
                original_row = original_df.iloc[idx].to_dict()
                for key, value in original_row.items():
                    # Apply field name mapping if exists
                    mapped_key = field_mappings.get(key, key)
                    
                    # Only add if it's a valid field
                    if mapped_key not in valid_fields:
                        continue
                    
                    # Convert numpy types to python types
                    if hasattr(value, 'item'):
                        value = value.item()
                    # Skip NaN values
                    if value != value:  # NaN check
                        continue
                    exoplanet_data[mapped_key] = value

                # Create and save exoplanet
                exoplanet = AnalyzedExoplanet(**exoplanet_data)
                db.add(exoplanet)

            await db.commit()
            print(f"✅ Saved {len(predictions_list)} analyzed exoplanets to database")

            # 8. Trigger background validation
            if background_tasks:
                validation_service = get_validation_service()
                background_tasks.add_task(
                    validation_service.validate_batch,
                    job_id,
                    db
                )
                print(f"🔍 Background validation queued for job {job_id}")

        except Exception as e:
            print(f"⚠️  Warning: Failed to save analyzed exoplanets: {str(e)}")
            # Don't fail the request if saving fails
            import traceback
            traceback.print_exc()

        # 9. Return response
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
    except ValueError as e:
        # CSV validation or preprocessing errors
        error_msg = str(e)
        print(f"❌ Validation error: {error_msg}")
        raise HTTPException(
            status_code=400,
            detail=f"Data validation error: {error_msg}"
        )
    except Exception as e:
        # Unexpected errors with detailed logging
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Unexpected error in upload endpoint:")
        print(error_trace)
        raise HTTPException(
            status_code=500,
            detail=f"Server error while processing your file: {str(e)}. "
                   f"Please check that your file contains valid data for either Kepler or TESS datasets."
        )
