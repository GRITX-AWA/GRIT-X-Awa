import pandas as pd
import numpy as np

# ========================================
# STEP 1: CREATE HABITABILITY CATEGORIES
# ========================================

# Binary flags
df['habitable_temperature'] = ((df['pl_eqt'] >= 273) & (df['pl_eqt'] <= 373)).astype(int)
df['conservative_habitable'] = ((df['pl_eqt'] >= 200) & (df['pl_eqt'] <= 400)).astype(int)

# Temperature classification
df['temperature_class'] = pd.cut(
    df['pl_eqt'],
    bins=[0, 200, 273, 373, 500, np.inf],
    labels=['Too Cold', 'Cold but Possible', 'Habitable', 'Hot', 'Too Hot']
)

# ========================================
# STEP 2: PRINT SUMMARY STATISTICS
# ========================================

print("="*70)
print("HABITABILITY CLASSIFICATION SUMMARY")
print("="*70)

# Count by temperature class
print("\nTemperature Distribution:")
print(df['temperature_class'].value_counts().sort_index())

print(f"\nHabitable Zone Statistics:")
print(f"  Planets in Habitable Zone (273-373K): {df['habitable_temperature'].sum()}")
print(f"  Planets in Conservative HZ (200-400K): {df['conservative_habitable'].sum()}")
print(f"  Total planets: {len(df)}")
print(f"  Percentage habitable: {(df['habitable_temperature'].sum() / len(df) * 100):.2f}%")

# ========================================
# STEP 3: DETAILED PLANET-BY-PLANET REPORT
# ========================================

print("\n" + "="*70)
print("DETAILED HABITABILITY REPORT (First 20 planets)")
print("="*70)

# Select relevant columns
report_cols = ['pl_eqt', 'pl_insol', 'pl_rade', 'temperature_class', 
               'habitable_temperature', 'conservative_habitable']

for idx, row in df.head(20).iterrows():
    print(f"\n{'='*70}")
    print(f"Planet #{idx + 1}")
    print(f"{'='*70}")
    
    # Temperature info
    temp_k = row['pl_eqt']
    temp_c = temp_k - 273.15 if pd.notna(temp_k) else None
    
    if pd.notna(temp_k):
        print(f"Equilibrium Temperature: {temp_k:.1f} K ({temp_c:.1f}°C)")
    else:
        print(f"Equilibrium Temperature: Not available")
    
    # Insolation
    if pd.notna(row['pl_insol']):
        print(f"Stellar Flux: {row['pl_insol']:.2f}x Earth")
    else:
        print(f"Stellar Flux: Not available")
    
    # Planet size
    if pd.notna(row['pl_rade']):
        print(f"Planet Radius: {row['pl_rade']:.2f} R⊕")
    else:
        print(f"Planet Radius: Not available")
    
    # Habitability assessment
    print(f"\n🌡  HABITABILITY ASSESSMENT:")
    print(f"   Temperature Class: {row['temperature_class']}")
    
    if row['habitable_temperature'] == 1:
        print(f"   ✅ IN HABITABLE ZONE (liquid water possible)")
    elif row['conservative_habitable'] == 1:
        print(f"   ⚠  IN CONSERVATIVE ZONE (marginal habitability)")
    else:
        # Determine why it's not habitable
        if pd.notna(temp_k):
            if temp_k < 273:
                print(f"   ❄  TOO COLD for liquid water ({temp_c:.1f}°C)")
                print(f"      Surface would be frozen")
            elif temp_k > 373:
                print(f"   🔥 TOO HOT for liquid water ({temp_c:.1f}°C)")
                print(f"      Water would boil away")
        else:
            print(f"   ❓ UNKNOWN (insufficient data)")

# ========================================
# STEP 4: FILTER AND DISPLAY HABITABLE PLANETS
# ========================================

print("\n\n" + "="*70)
print("🌍 POTENTIALLY HABITABLE PLANETS")
print("="*70)

habitable_planets = df[df['habitable_temperature'] == 1].copy()

if len(habitable_planets) > 0:
    print(f"\nFound {len(habitable_planets)} potentially habitable planets!\n")
    
    for idx, row in habitable_planets.head(10).iterrows():
        temp_c = row['pl_eqt'] - 273.15
        print(f"🌟 Planet #{idx + 1}")
        print(f"   Temperature: {row['pl_eqt']:.1f} K ({temp_c:.1f}°C)")
        print(f"   Stellar Flux: {row['pl_insol']:.2f}x Earth" if pd.notna(row['pl_insol']) else "   Stellar Flux: N/A")
        print(f"   Radius: {row['pl_rade']:.2f} R⊕" if pd.notna(row['pl_rade']) else "   Radius: N/A")
        
        # Additional context
        if pd.notna(row['pl_rade']):
            if row['pl_rade'] <= 1.5:
                print(f"   Type: Earth-like (rocky)")
            elif row['pl_rade'] <= 4.0:
                print(f"   Type: Super-Earth (possibly rocky)")
            else:
                print(f"   Type: Gas giant (unlikely to be habitable)")
        print()
else:
    print("\n⚠  No planets found in strict habitable zone (273-373K)")

# ========================================
# STEP 5: COLD AND HOT EXTREMES
# ========================================

print("\n" + "="*70)
print("❄  COLDEST PLANETS")
print("="*70)

coldest = df.nsmallest(5, 'pl_eqt')
for idx, row in coldest.iterrows():
    temp_c = row['pl_eqt'] - 273.15
    print(f"   {row['pl_eqt']:.1f} K ({temp_c:.1f}°C) - Frozen world")

print("\n" + "="*70)
print("🔥 HOTTEST PLANETS")
print("="*70)

hottest = df.nlargest(5, 'pl_eqt')
for idx, row in hottest.iterrows():
    temp_c = row['pl_eqt'] - 273.15
    print(f"   {row['pl_eqt']:.1f} K ({temp_c:.1f}°C) - Scorching hell")

# ========================================
# STEP 6: EXPORT RESULTS
# ========================================

print("\n" + "="*70)
print("SAVING RESULTS")
print("="*70)

# Save habitable planets to CSV
if len(habitable_planets) > 0:
    habitable_planets.to_csv('habitable_planets.csv', index=False)
    print(f"✅ Saved {len(habitable_planets)} habitable planets to 'habitable_planets.csv'")

# Save full dataset with new columns
df.to_csv('tess_with_habitability.csv', index=False)
print(f"✅ Saved full dataset with habitability features to 'tess_with_habitability.csv'")

print("\n" + "="*70)
print("✅ HABITABILITY ANALYSIS COMPLETE")
print("="*70)


# Liquid water range (0°C to 100°C = 273K to 373K)
df['habitable_temperature'] = ((df['pl_eqt'] >= 273) & (df['pl_eqt'] <= 373)).astype(int)

# Conservative habitable zone (allows for atmospheric effects)
df['conservative_habitable'] = ((df['pl_eqt'] >= 200) & (df['pl_eqt'] <= 400)).astype(int)

# Classification
df['temperature_class'] = pd.cut(
    df['pl_eqt'],
    bins=[0, 200, 273, 373, 500, np.inf],
    labels=['Too Cold', 'Cold but Possible', 'Habitable', 'Hot', 'Too Hot']
)