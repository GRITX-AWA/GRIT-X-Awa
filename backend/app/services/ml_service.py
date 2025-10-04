# ML service for handling predictions
import asyncio
import httpx
from app.core.config import settings

class MLService:
    def __init__(self):
        self.ml_api_url = getattr(settings, 'ML_API_URL', 'http://localhost:8001')
    
    async def predict(self, input_data: dict):
        """Make prediction using external ML API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ml_api_url}/predict",
                    json=input_data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            # Fallback to dummy response if ML API is unavailable
            await asyncio.sleep(1)  # Simulate processing time
            return {
                "prediction": 0.69,
                "model": "fallback",
                "note": f"ML API unavailable, using fallback: {str(e)}"
            }

# Dummy ML service - returns 69 for any input (backwards compatibility)
async def get_prediction(input_data: dict):
    """Legacy function for backwards compatibility"""
    ml_service = MLService()
    result = await ml_service.predict(input_data)
    return result.get("prediction", 69)
