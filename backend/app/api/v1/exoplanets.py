# app/api/v1/exoplanets.py
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.exoplanet import AnalyzedExoplanet
from app.schemas.exoplanet import (
    ExoplanetResponse,
    ExoplanetCreate,
    ExoplanetValidationResult
)
from app.services.validation_service import get_validation_service

router = APIRouter(prefix="/api/v1/exoplanets", tags=["exoplanets"])


@router.get("/", response_model=List[ExoplanetResponse])
async def get_analyzed_exoplanets(
    dataset_type: Optional[str] = None,
    validated: Optional[bool] = None,
    validation_status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all analyzed exoplanets with optional filters

    Args:
        dataset_type: Filter by 'kepler' or 'tess'
        validated: Filter by validation status
        validation_status: Filter by specific validation status ('matched', 'new_discovery', 'pending', 'error')
        limit: Maximum number of results (1-500)
        offset: Number of results to skip
    """
    try:
        query = select(AnalyzedExoplanet)

        # Apply filters
        conditions = []
        if dataset_type:
            conditions.append(AnalyzedExoplanet.dataset_type == dataset_type)
        if validated is not None:
            conditions.append(AnalyzedExoplanet.validated == validated)
        if validation_status:
            conditions.append(AnalyzedExoplanet.validation_status == validation_status)

        if conditions:
            query = query.where(and_(*conditions))

        # Order by newest first
        query = query.order_by(desc(AnalyzedExoplanet.created_at))

        # Apply pagination
        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        exoplanets = result.scalars().all()

        return exoplanets

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve exoplanets: {str(e)}")


@router.get("/new-discoveries", response_model=List[ExoplanetResponse])
async def get_new_discoveries(
    dataset_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all potential new exoplanet discoveries (not matched with existing dataset)
    """
    try:
        query = select(AnalyzedExoplanet).where(
            AnalyzedExoplanet.validation_status == 'new_discovery'
        )

        if dataset_type:
            query = query.where(AnalyzedExoplanet.dataset_type == dataset_type)

        query = query.order_by(desc(AnalyzedExoplanet.created_at)).limit(limit)

        result = await db.execute(query)
        exoplanets = result.scalars().all()

        return exoplanets

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve new discoveries: {str(e)}")


@router.get("/job/{job_id}", response_model=List[ExoplanetResponse])
async def get_exoplanets_by_job(
    job_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all analyzed exoplanets for a specific job
    """
    try:
        result = await db.execute(
            select(AnalyzedExoplanet).where(
                AnalyzedExoplanet.job_id == job_id
            ).order_by(AnalyzedExoplanet.row_index)
        )
        exoplanets = result.scalars().all()

        if not exoplanets:
            raise HTTPException(
                status_code=404,
                detail=f"No analyzed exoplanets found for job_id: {job_id}"
            )

        return exoplanets

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve exoplanets: {str(e)}")


@router.get("/{exoplanet_id}", response_model=ExoplanetResponse)
async def get_exoplanet_by_id(
    exoplanet_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific analyzed exoplanet by ID
    """
    try:
        result = await db.execute(
            select(AnalyzedExoplanet).where(AnalyzedExoplanet.id == exoplanet_id)
        )
        exoplanet = result.scalar_one_or_none()

        if not exoplanet:
            raise HTTPException(status_code=404, detail=f"Exoplanet {exoplanet_id} not found")

        return exoplanet

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve exoplanet: {str(e)}")


@router.post("/validate/{job_id}")
async def trigger_validation(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Manually trigger validation for a job (validation also runs automatically in background)
    """
    try:
        # Check if job exists
        result = await db.execute(
            select(AnalyzedExoplanet).where(AnalyzedExoplanet.job_id == job_id).limit(1)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

        # Add validation task to background
        validation_service = get_validation_service()
        background_tasks.add_task(validation_service.validate_batch, job_id, db)

        return {
            "status": "success",
            "message": f"Validation started for job {job_id}",
            "job_id": job_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger validation: {str(e)}")


@router.get("/stats/summary")
async def get_exoplanet_stats(
    dataset_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get summary statistics for analyzed exoplanets
    """
    try:
        query = select(AnalyzedExoplanet)

        if dataset_type:
            query = query.where(AnalyzedExoplanet.dataset_type == dataset_type)

        result = await db.execute(query)
        all_exoplanets = result.scalars().all()

        total = len(all_exoplanets)
        validated = sum(1 for e in all_exoplanets if e.validated)
        new_discoveries = sum(1 for e in all_exoplanets if e.validation_status == 'new_discovery')
        matched = sum(1 for e in all_exoplanets if e.validation_status == 'matched')
        pending = sum(1 for e in all_exoplanets if e.validation_status == 'pending' or not e.validated)

        # Group by predicted class
        class_distribution = {}
        for exoplanet in all_exoplanets:
            cls = exoplanet.predicted_class
            class_distribution[cls] = class_distribution.get(cls, 0) + 1

        return {
            "total_analyzed": total,
            "validated": validated,
            "pending_validation": pending,
            "matched_with_dataset": matched,
            "new_discoveries": new_discoveries,
            "class_distribution": class_distribution,
            "dataset_type": dataset_type or "all"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")
