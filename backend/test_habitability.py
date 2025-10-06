"""
Test script for habitability and classification utilities
Run this to verify the logic works correctly
"""
from app.utils.habitability import HabitabilityZone, StarClassification, PlanetClassification


def test_habitability_zones():
    print("="*70)
    print("TESTING HABITABILITY ZONES")
    print("="*70)
    
    # Test Earth-like conditions
    earth_temp = 288  # 15°C
    status = HabitabilityZone.get_habitability_status(earth_temp, 1.0)
    print(f"\n🌍 Earth-like Planet (288K, 1.0 R⊕):")
    print(f"  Habitable: {status['is_habitable']}")
    print(f"  Zone: {status['temperature_class']}")
    print(f"  Description: {status['zone_description']}")
    
    score = HabitabilityZone.habitability_score(earth_temp, 1.0, 1.0)
    print(f"  Habitability Score: {score}/100")
    
    # Test Hot Jupiter
    hot_temp = 1200
    status = HabitabilityZone.get_habitability_status(hot_temp, 11.0)
    print(f"\n🔥 Hot Jupiter (1200K, 11.0 R⊕):")
    print(f"  Habitable: {status['is_habitable']}")
    print(f"  Zone: {status['temperature_class']}")
    print(f"  Description: {status['zone_description']}")
    
    score = HabitabilityZone.habitability_score(hot_temp, 11.0, 100.0)
    print(f"  Habitability Score: {score}/100")
    
    # Test Cold Super-Earth
    cold_temp = 220
    status = HabitabilityZone.get_habitability_status(cold_temp, 1.7)
    print(f"\n❄️  Cold Super-Earth (220K, 1.7 R⊕):")
    print(f"  Habitable (Conservative): {status['is_conservative_habitable']}")
    print(f"  Zone: {status['temperature_class']}")
    print(f"  Description: {status['zone_description']}")
    
    score = HabitabilityZone.habitability_score(cold_temp, 1.7, 0.3)
    print(f"  Habitability Score: {score}/100")


def test_star_classification():
    print("\n" + "="*70)
    print("TESTING STAR CLASSIFICATION")
    print("="*70)
    
    # Test Sun-like star
    sun_temp = 5778
    info = StarClassification.get_star_info(sun_temp, 1.0)
    print(f"\n☀️  Sun-like Star ({sun_temp}K, 1.0 R☉):")
    print(f"  Spectral Type: {info['spectral_type']}")
    print(f"  Color: {info['color']}")
    print(f"  Mass Range: {info['typical_mass_range']}")
    print(f"  Description: {info['description'][:80]}...")
    
    # Test Red Dwarf
    dwarf_temp = 3000
    info = StarClassification.get_star_info(dwarf_temp, 0.3)
    print(f"\n🔴 Red Dwarf ({dwarf_temp}K, 0.3 R☉):")
    print(f"  Spectral Type: {info['spectral_type']}")
    print(f"  Color: {info['color']}")
    print(f"  Mass Range: {info['typical_mass_range']}")
    print(f"  Description: {info['description'][:80]}...")
    
    # Test Blue Giant
    giant_temp = 15000
    info = StarClassification.get_star_info(giant_temp, 5.0)
    print(f"\n🔵 Blue Giant ({giant_temp}K, 5.0 R☉):")
    print(f"  Spectral Type: {info['spectral_type']}")
    print(f"  Color: {info['color']}")
    print(f"  Mass Range: {info['typical_mass_range']}")
    print(f"  Brightness: {info['relative_brightness']}")
    print(f"  Description: {info['description'][:80]}...")


def test_planet_classification():
    print("\n" + "="*70)
    print("TESTING PLANET CLASSIFICATION")
    print("="*70)
    
    # Test Earth-like
    info = PlanetClassification.get_planet_info(1.0, 288, 365)
    print(f"\n🌍 Earth-like (1.0 R⊕, 288K, 365 days):")
    print(f"  Type: {info['planet_type']}")
    print(f"  Composition: {info['likely_composition']}")
    print(f"  Orbital Class: {info['orbital_class']}")
    print(f"  Description: {info['description'][:80]}...")
    
    # Test Super-Earth
    info = PlanetClassification.get_planet_info(1.7, 320, 50)
    print(f"\n🌎 Super-Earth (1.7 R⊕, 320K, 50 days):")
    print(f"  Type: {info['planet_type']}")
    print(f"  Composition: {info['likely_composition']}")
    print(f"  Orbital Class: {info['orbital_class']}")
    print(f"  Description: {info['description'][:80]}...")
    
    # Test Gas Giant
    info = PlanetClassification.get_planet_info(11.0, 1200, 3)
    print(f"\n🪐 Gas Giant (11.0 R⊕, 1200K, 3 days):")
    print(f"  Type: {info['planet_type']}")
    print(f"  Composition: {info['likely_composition']}")
    print(f"  Orbital Class: {info['orbital_class']}")
    print(f"  Description: {info['description'][:80]}...")


def test_comprehensive_analysis():
    print("\n" + "="*70)
    print("COMPREHENSIVE ANALYSIS EXAMPLES")
    print("="*70)
    
    # TOI-700 d (potentially habitable)
    print(f"\n🌟 TOI-700 d Analysis:")
    print(f"  Planet: 1.19 R⊕, 269K, 37.4 days")
    print(f"  Star: 3480K (M-type red dwarf)")
    
    planet_info = PlanetClassification.get_planet_info(1.19, 269, 37.4)
    hab_status = HabitabilityZone.get_habitability_status(269, 1.19)
    star_info = StarClassification.get_star_info(3480)
    hab_score = HabitabilityZone.habitability_score(269, 1.19, 0.29)
    
    print(f"\n  Planet Classification: {planet_info['planet_type']}")
    print(f"  Star Type: {star_info['spectral_type']}-type ({star_info['color']})")
    print(f"  Habitability Zone: {hab_status['temperature_class']}")
    print(f"  Conservative Habitable: {hab_status['is_conservative_habitable']}")
    print(f"  Habitability Score: {hab_score:.1f}/100")
    print(f"  Assessment: {hab_status['zone_description']}")


if __name__ == "__main__":
    test_habitability_zones()
    test_star_classification()
    test_planet_classification()
    test_comprehensive_analysis()
    
    print("\n" + "="*70)
    print("✅ ALL TESTS COMPLETED SUCCESSFULLY")
    print("="*70)
