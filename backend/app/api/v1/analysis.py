from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.dataset import SpaceData

router = APIRouter(prefix="/analysis", tags=["analysis"], responses={404: {"description": "Not found"}})

@router.get("/deep/{object_id}")
async def deep_analysis(object_id: str, db: Session = Depends(get_db)):
    """
    Deep analysis endpoint for the given object_id (kepid).
    Validates if the object_id is valid and exists in the Kepler dataset.
    """
    # Validate object_id
    if not object_id or not object_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid object ID")

    # Query the database for the object
    space_data = db.query(SpaceData).filter(SpaceData.kepid == int(object_id)).first()
    if not space_data:
        raise HTTPException(status_code=404, detail="Object ID not found in dataset")

    # Perform analysis based on the data
    analysis_result = {
        "object_id": object_id,
        "kepler_name": space_data.kepler_name,
        "disposition": space_data.koi_disposition,
        "confidence": 85 if space_data.koi_disposition == "CONFIRMED" else 60,  # Dummy confidence
        "type": "Unknown",  # Could be enhanced with ML
        "features": {
            "period": space_data.koi_period,
            "radius": space_data.koi_prad,
            "semi_major_axis": space_data.koi_sma,
            "inclination": space_data.koi_incl,
            "equilibrium_temp": space_data.koi_teq,
            "insolation": space_data.koi_insol
        },
        "status": space_data.koi_disposition.lower() if space_data.koi_disposition else "unknown",
        "message": "Deep analysis completed successfully."
    }

    return analysis_result
