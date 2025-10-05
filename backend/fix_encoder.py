#!/usr/bin/env python3
"""
Fix the Kepler encoder to use the correct labels
"""
import pickle
from sklearn.preprocessing import LabelEncoder

# Create a new LabelEncoder with the correct classes
encoder = LabelEncoder()

# These are the correct classes for koi_pdisposition
correct_classes = ['CANDIDATE', 'CONFIRMED', 'FALSE POSITIVE']

# Fit the encoder with the correct classes
encoder.fit(correct_classes)

print("Created encoder with classes:", list(encoder.classes_))

# Test it
for label in correct_classes:
    encoded = encoder.transform([label])[0]
    print(f"  '{label}' -> {encoded}")

# Save it
with open('kepler/encoders.pkl', 'wb') as f:
    pickle.dump(encoder, f)

print("\n✅ Saved fixed encoder to kepler/encoders.pkl")

# Verify by reloading
with open('kepler/encoders.pkl', 'rb') as f:
    loaded = pickle.load(f)

print("\n✅ Verification - loaded encoder classes:", list(loaded.classes_))

# Test the loaded encoder
print("\nTesting loaded encoder:")
for label in correct_classes:
    encoded = loaded.transform([label])[0]
    print(f"  '{label}' -> {encoded}")
