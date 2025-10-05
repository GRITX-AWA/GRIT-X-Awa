#!/usr/bin/env python3
"""Check what labels the Kepler encoder knows about"""
import pickle
import sys

try:
    # Load the encoder
    with open('kepler/encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)

    print("Encoder type:", type(encoders))
    print()

    if isinstance(encoders, dict):
        print("Encoders is a dictionary with keys:", list(encoders.keys()))
        for key, encoder in encoders.items():
            print(f"\nEncoder for '{key}':")
            if hasattr(encoder, 'classes_'):
                print(f"  Classes: {list(encoder.classes_)}")
            else:
                print(f"  Type: {type(encoder)}")
    else:
        print("Encoders is a single encoder")
        if hasattr(encoders, 'classes_'):
            print(f"  Classes: {list(encoders.classes_)}")
            print(f"  Number of classes: {len(encoders.classes_)}")
        else:
            print(f"  Type: {type(encoders)}")

    # Test encoding
    print("\nTesting encoding:")
    test_values = ['CANDIDATE', 'CONFIRMED', 'FALSE POSITIVE']

    if isinstance(encoders, dict) and 'koi_pdisposition' in encoders:
        encoder = encoders['koi_pdisposition']
    else:
        encoder = encoders

    for val in test_values:
        try:
            encoded = encoder.transform([val])[0]
            print(f"  '{val}' -> {encoded} ✓")
        except ValueError as e:
            print(f"  '{val}' -> ERROR: {e}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
