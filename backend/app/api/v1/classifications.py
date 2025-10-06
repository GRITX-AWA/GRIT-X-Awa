# app/api/v1/classifications.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.utils.habitability import HabitabilityZone, StarClassification, PlanetClassification

router = APIRouter(prefix="/api/v1/classifications", tags=["classifications"])


class PlanetAnalysisRequest(BaseModel):
    """Request for planet analysis"""
    temperature_k: Optional[float] = None
    radius_earth: Optional[float] = None
    orbital_period_days: Optional[float] = None
    insolation: Optional[float] = None
    star_temperature_k: Optional[float] = None
    star_radius_solar: Optional[float] = None


class PlanetAnalysisResponse(BaseModel):
    """Complete analysis of a planet and its host star"""
    planet_classification: dict
    habitability_status: dict
    star_classification: Optional[dict] = None
    habitability_score: Optional[float] = None


@router.post("/analyze", response_model=PlanetAnalysisResponse)
async def analyze_planet(data: PlanetAnalysisRequest):
    """
    Analyze a planet's habitability and classification
    
    Provides comprehensive information about:
    - Planet type and composition
    - Habitability zone status
    - Host star classification
    - Overall habitability score
    """
    try:
        response = {}
        
        # Planet classification
        if data.radius_earth:
            planet_info = PlanetClassification.get_planet_info(
                data.radius_earth,
                data.temperature_k,
                data.orbital_period_days
            )
            response["planet_classification"] = planet_info
        else:
            response["planet_classification"] = {"planet_type": "Unknown"}
        
        # Habitability status
        if data.temperature_k:
            habitability = HabitabilityZone.get_habitability_status(
                data.temperature_k,
                data.radius_earth
            )
            response["habitability_status"] = habitability
            
            # Calculate habitability score
            score = HabitabilityZone.habitability_score(
                data.temperature_k,
                data.radius_earth,
                data.insolation
            )
            response["habitability_score"] = round(score, 2)
        else:
            response["habitability_status"] = {
                "is_habitable": False,
                "temperature_class": "Unknown"
            }
            response["habitability_score"] = 0.0
        
        # Star classification
        if data.star_temperature_k:
            star_info = StarClassification.get_star_info(
                data.star_temperature_k,
                data.star_radius_solar
            )
            response["star_classification"] = star_info
        else:
            response["star_classification"] = None
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/star-types")
async def get_star_types():
    """Get information about all star spectral types"""
    types = []
    for temp in [35000, 15000, 8500, 6500, 5500, 4500, 3000]:
        spectral = StarClassification.classify_spectral_type(temp)
        info = StarClassification.get_star_info(temp)
        types.append(info)
    
    return {"star_types": types}


@router.get("/planet-types")
async def get_planet_types():
    """Get information about all planet classification types"""
    types = []
    for radius in [0.3, 1.0, 1.7, 3.0, 7.0, 12.0]:
        planet_type = PlanetClassification.classify_by_radius(radius)
        info = PlanetClassification.get_planet_info(radius)
        types.append(info)
    
    return {"planet_types": types}


@router.get("/habitability-zones")
async def get_habitability_zones():
    """Get information about different habitability zones"""
    zones = {
        "strict": {
            "min_temp_k": HabitabilityZone.WATER_FREEZING,
            "max_temp_k": HabitabilityZone.WATER_BOILING,
            "min_temp_c": HabitabilityZone.WATER_FREEZING - 273.15,
            "max_temp_c": HabitabilityZone.WATER_BOILING - 273.15,
            "description": "Liquid water range - most likely to support life"
        },
        "conservative": {
            "min_temp_k": HabitabilityZone.CONSERVATIVE_MIN,
            "max_temp_k": HabitabilityZone.CONSERVATIVE_MAX,
            "min_temp_c": HabitabilityZone.CONSERVATIVE_MIN - 273.15,
            "max_temp_c": HabitabilityZone.CONSERVATIVE_MAX - 273.15,
            "description": "Conservative habitable zone with atmospheric effects"
        },
        "optimistic": {
            "min_temp_k": HabitabilityZone.OPTIMISTIC_MIN,
            "max_temp_k": HabitabilityZone.OPTIMISTIC_MAX,
            "min_temp_c": HabitabilityZone.OPTIMISTIC_MIN - 273.15,
            "max_temp_c": HabitabilityZone.OPTIMISTIC_MAX - 273.15,
            "description": "Optimistic range including subsurface water possibilities"
        }
    }
    
    return {"zones": zones}
