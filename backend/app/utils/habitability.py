"""
Habitability and Classification Utilities for Exoplanets
Provides scientific classification for planets and host stars
"""
import math
from typing import Dict, Tuple, Optional


class HabitabilityZone:
    """Calculate and classify planet habitability based on temperature and other factors"""
    
    # Temperature thresholds (in Kelvin)
    WATER_FREEZING = 273.15  # 0°C
    WATER_BOILING = 373.15   # 100°C
    CONSERVATIVE_MIN = 200   # Conservative habitable zone minimum
    CONSERVATIVE_MAX = 450   # Conservative habitable zone maximum
    OPTIMISTIC_MIN = 150     # Optimistic (with thick atmosphere)
    OPTIMISTIC_MAX = 500     # Optimistic (subsurface water)
    
    @staticmethod
    def classify_temperature(temp_k: float) -> str:
        """Classify planet by temperature zone"""
        if temp_k is None:
            return "Unknown"
        
        if temp_k < HabitabilityZone.OPTIMISTIC_MIN:
            return "Frozen World"
        elif temp_k < HabitabilityZone.CONSERVATIVE_MIN:
            return "Very Cold"
        elif temp_k < HabitabilityZone.WATER_FREEZING:
            return "Cold"
        elif temp_k <= HabitabilityZone.WATER_BOILING:
            return "Habitable Zone"
        elif temp_k <= HabitabilityZone.CONSERVATIVE_MAX:
            return "Warm"
        elif temp_k <= HabitabilityZone.OPTIMISTIC_MAX:
            return "Very Hot"
        else:
            return "Inferno"
    
    @staticmethod
    def is_habitable(temp_k: float, conservative: bool = False, optimistic: bool = False) -> bool:
        """Check if planet is in habitable zone"""
        if temp_k is None:
            return False
        
        if optimistic:
            return HabitabilityZone.OPTIMISTIC_MIN <= temp_k <= HabitabilityZone.OPTIMISTIC_MAX
        elif conservative:
            return HabitabilityZone.CONSERVATIVE_MIN <= temp_k <= HabitabilityZone.CONSERVATIVE_MAX
        else:
            # Standard: liquid water range
            return HabitabilityZone.WATER_FREEZING <= temp_k <= HabitabilityZone.WATER_BOILING
    
    @staticmethod
    def habitability_score(temp_k: float, radius_earth: float = None, 
                          insolation: float = None) -> float:
        """
        Calculate a habitability score (0-100)
        Based on temperature, size, and stellar insolation
        """
        if temp_k is None:
            return 0.0
        
        score = 0.0
        
        # Temperature component (0-50 points)
        if HabitabilityZone.WATER_FREEZING <= temp_k <= HabitabilityZone.WATER_BOILING:
            # Perfect range
            score += 50
        elif HabitabilityZone.CONSERVATIVE_MIN <= temp_k <= HabitabilityZone.CONSERVATIVE_MAX:
            # Conservative range
            # Calculate distance from perfect range
            if temp_k < HabitabilityZone.WATER_FREEZING:
                diff = HabitabilityZone.WATER_FREEZING - temp_k
                score += 50 - (diff / (HabitabilityZone.WATER_FREEZING - HabitabilityZone.CONSERVATIVE_MIN)) * 25
            else:
                diff = temp_k - HabitabilityZone.WATER_BOILING
                score += 50 - (diff / (HabitabilityZone.CONSERVATIVE_MAX - HabitabilityZone.WATER_BOILING)) * 25
        elif HabitabilityZone.OPTIMISTIC_MIN <= temp_k <= HabitabilityZone.OPTIMISTIC_MAX:
            # Optimistic range - minimal points
            score += 10
        
        # Size component (0-30 points) - Earth-like size is best
        if radius_earth is not None:
            if 0.5 <= radius_earth <= 1.5:
                # Earth-like rocky planet
                score += 30
            elif 1.5 <= radius_earth <= 2.5:
                # Super-Earth
                score += 20
            elif 2.5 <= radius_earth <= 4.0:
                # Mini-Neptune (less likely to be habitable)
                score += 10
            # Larger planets (gas giants) get 0 points
        
        # Insolation component (0-20 points) - Earth-like insolation is best
        if insolation is not None:
            if 0.25 <= insolation <= 1.75:
                # Similar to Earth's insolation
                score += 20
            elif 0.1 <= insolation <= 3.0:
                # Broader range
                score += 10
        
        return min(score, 100.0)
    
    @staticmethod
    def get_habitability_status(temp_k: float, radius_earth: float = None) -> Dict[str, any]:
        """Get comprehensive habitability information"""
        temp_class = HabitabilityZone.classify_temperature(temp_k) if temp_k else "Unknown"
        
        status = {
            "is_habitable": HabitabilityZone.is_habitable(temp_k),
            "is_conservative_habitable": HabitabilityZone.is_habitable(temp_k, conservative=True),
            "is_optimistic_habitable": HabitabilityZone.is_habitable(temp_k, optimistic=True),
            "temperature_class": temp_class,
            "temperature_celsius": temp_k - 273.15 if temp_k else None,
            "zone_description": HabitabilityZone.get_zone_description(temp_class, radius_earth)
        }
        
        return status
    
    @staticmethod
    def get_zone_description(temp_class: str, radius_earth: float = None) -> str:
        """Get human-readable description of the habitability zone"""
        descriptions = {
            "Frozen World": "Surface completely frozen, no liquid water possible",
            "Very Cold": "Extremely cold, possibly with subsurface water if geologically active",
            "Cold": "Below freezing, but might support liquid water with greenhouse effect",
            "Habitable Zone": "Perfect for liquid water - potential for life as we know it",
            "Warm": "Hot but might have water in cooler regions or underground",
            "Very Hot": "Scorching temperatures, water would only exist deep underground",
            "Inferno": "Extreme heat, surface likely molten - no water possible",
            "Unknown": "Insufficient data to determine habitability"
        }
        
        description = descriptions.get(temp_class, "Unknown conditions")
        
        # Add size context
        if radius_earth is not None:
            if radius_earth <= 1.5:
                description += " | Rocky planet similar to Earth"
            elif radius_earth <= 2.5:
                description += " | Super-Earth, likely rocky with thick atmosphere"
            elif radius_earth <= 4.0:
                description += " | Mini-Neptune, substantial gas envelope"
            else:
                description += " | Gas giant, unlikely to have solid surface"
        
        return description


class StarClassification:
    """Classify host stars by spectral type and other properties"""
    
    @staticmethod
    def classify_spectral_type(temp_k: float) -> str:
        """Classify star by Harvard spectral type (OBAFGKM)"""
        if temp_k is None:
            return "Unknown"
        
        if temp_k >= 30000:
            return "O"
        elif temp_k >= 10000:
            return "B"
        elif temp_k >= 7500:
            return "A"
        elif temp_k >= 6000:
            return "F"
        elif temp_k >= 5200:
            return "G"
        elif temp_k >= 3700:
            return "K"
        elif temp_k >= 2400:
            return "M"
        else:
            return "L/T"  # Brown dwarfs
    
    @staticmethod
    def get_star_color(temp_k: float) -> str:
        """Get the visible color of the star"""
        if temp_k is None:
            return "Unknown"
        
        if temp_k >= 30000:
            return "Blue"
        elif temp_k >= 10000:
            return "Blue-White"
        elif temp_k >= 7500:
            return "White"
        elif temp_k >= 6000:
            return "Yellow-White"
        elif temp_k >= 5200:
            return "Yellow"
        elif temp_k >= 3700:
            return "Orange"
        elif temp_k >= 2400:
            return "Red"
        else:
            return "Dark Red/Brown"
    
    @staticmethod
    def get_star_info(temp_k: float, radius_solar: float = None) -> Dict[str, any]:
        """Get comprehensive star information"""
        spectral_type = StarClassification.classify_spectral_type(temp_k)
        
        info = {
            "spectral_type": spectral_type,
            "spectral_class_full": f"{spectral_type}-type",
            "color": StarClassification.get_star_color(temp_k),
            "temperature_k": temp_k,
            "description": StarClassification.get_star_description(spectral_type),
            "relative_brightness": StarClassification.get_relative_brightness(spectral_type),
            "typical_mass_range": StarClassification.get_mass_range(spectral_type)
        }
        
        if radius_solar is not None:
            info["radius_solar"] = radius_solar
            info["size_class"] = StarClassification.classify_size(radius_solar, spectral_type)
        
        return info
    
    @staticmethod
    def get_star_description(spectral_type: str) -> str:
        """Get description of star type"""
        descriptions = {
            "O": "Very rare, extremely hot, massive blue stars. Short-lived but incredibly luminous.",
            "B": "Hot, blue-white stars. Rare but very bright.",
            "A": "White stars with strong hydrogen lines. Include famous stars like Sirius and Vega.",
            "F": "Yellow-white stars, slightly hotter and larger than our Sun.",
            "G": "Sun-like yellow stars. Our Sun is a G2V star. Ideal for habitability.",
            "K": "Orange stars, cooler than the Sun. Very common and long-lived.",
            "M": "Cool red dwarf stars. Most common stars in the universe. Long-lived and stable.",
            "L/T": "Brown dwarfs - failed stars not massive enough for sustained fusion.",
            "Unknown": "Spectral type cannot be determined from available data."
        }
        return descriptions.get(spectral_type, "No description available")
    
    @staticmethod
    def get_relative_brightness(spectral_type: str) -> str:
        """Get relative brightness compared to Sun"""
        brightness = {
            "O": "100,000+ times brighter than Sun",
            "B": "10,000 times brighter than Sun",
            "A": "10-100 times brighter than Sun",
            "F": "2-10 times brighter than Sun",
            "G": "Similar to Sun",
            "K": "0.1-1 times Sun's brightness",
            "M": "0.001-0.1 times Sun's brightness",
            "L/T": "Much dimmer than Sun",
            "Unknown": "Unknown"
        }
        return brightness.get(spectral_type, "Unknown")
    
    @staticmethod
    def get_mass_range(spectral_type: str) -> str:
        """Get typical mass range in solar masses"""
        masses = {
            "O": "16-50+ M☉",
            "B": "2.1-16 M☉",
            "A": "1.4-2.1 M☉",
            "F": "1.04-1.4 M☉",
            "G": "0.8-1.04 M☉",
            "K": "0.45-0.8 M☉",
            "M": "0.08-0.45 M☉",
            "L/T": "<0.08 M☉",
            "Unknown": "Unknown"
        }
        return masses.get(spectral_type, "Unknown")
    
    @staticmethod
    def classify_size(radius_solar: float, spectral_type: str = None) -> str:
        """Classify star size (dwarf, subgiant, giant, supergiant)"""
        if radius_solar is None:
            return "Unknown"
        
        # For main sequence stars (most common)
        if radius_solar < 0.5:
            return "Subdwarf"
        elif radius_solar < 1.5:
            return "Main Sequence (Dwarf)"
        elif radius_solar < 10:
            return "Subgiant"
        elif radius_solar < 100:
            return "Giant"
        else:
            return "Supergiant"


class PlanetClassification:
    """Classify exoplanets by size and composition"""
    
    @staticmethod
    def classify_by_radius(radius_earth: float) -> str:
        """Classify planet type by radius"""
        if radius_earth is None:
            return "Unknown"
        
        if radius_earth < 0.5:
            return "Sub-Earth"
        elif radius_earth < 1.25:
            return "Earth-like"
        elif radius_earth < 2.0:
            return "Super-Earth"
        elif radius_earth < 4.0:
            return "Mini-Neptune"
        elif radius_earth < 10.0:
            return "Neptune-like"
        else:
            return "Jupiter-like"
    
    @staticmethod
    def get_planet_info(radius_earth: float, temp_k: float = None, 
                       orbital_period: float = None) -> Dict[str, any]:
        """Get comprehensive planet classification"""
        planet_type = PlanetClassification.classify_by_radius(radius_earth)
        
        info = {
            "planet_type": planet_type,
            "radius_earth": radius_earth,
            "description": PlanetClassification.get_type_description(planet_type),
            "likely_composition": PlanetClassification.get_composition(planet_type)
        }
        
        if temp_k:
            info["temperature_k"] = temp_k
            info["temperature_celsius"] = temp_k - 273.15
        
        if orbital_period:
            info["orbital_period_days"] = orbital_period
            info["orbital_class"] = PlanetClassification.classify_orbit(orbital_period)
        
        return info
    
    @staticmethod
    def get_type_description(planet_type: str) -> str:
        """Get description of planet type"""
        descriptions = {
            "Sub-Earth": "Smaller than Earth, likely rocky. Examples: Mars, Mercury.",
            "Earth-like": "Similar size to Earth. Most likely to be rocky and potentially habitable.",
            "Super-Earth": "Larger than Earth but smaller than Neptune. Likely rocky with thick atmosphere.",
            "Mini-Neptune": "Between Earth and Neptune. Substantial gaseous envelope, possibly rocky core.",
            "Neptune-like": "Ice giant similar to Neptune/Uranus. Thick atmosphere, possible water oceans.",
            "Jupiter-like": "Gas giant. Massive atmosphere of hydrogen/helium, no solid surface.",
            "Unknown": "Insufficient data to classify planet type."
        }
        return descriptions.get(planet_type, "No description available")
    
    @staticmethod
    def get_composition(planet_type: str) -> str:
        """Get likely composition"""
        compositions = {
            "Sub-Earth": "Rocky (iron/silicate core)",
            "Earth-like": "Rocky (iron core, silicate mantle)",
            "Super-Earth": "Rocky/Water (iron-silicate, possible water layer)",
            "Mini-Neptune": "Gas/Ice (rocky core, thick H/He envelope)",
            "Neptune-like": "Ice/Gas (rock/ice core, thick atmosphere)",
            "Jupiter-like": "Gas (small core, mostly H/He)",
            "Unknown": "Unknown"
        }
        return compositions.get(planet_type, "Unknown")
    
    @staticmethod
    def classify_orbit(period_days: float) -> str:
        """Classify orbital period"""
        if period_days is None:
            return "Unknown"
        
        if period_days < 1:
            return "Ultra-Short Period"
        elif period_days < 10:
            return "Short Period (Hot)"
        elif period_days < 100:
            return "Medium Period (Warm)"
        elif period_days < 365:
            return "Long Period (Temperate)"
        else:
            return "Very Long Period (Cold)"
