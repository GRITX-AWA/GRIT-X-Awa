"""
Check Training Progress
Run this to see if training is complete and view results
"""

from pathlib import Path
import json
import time

IMPROVED_DIR = Path("tess/trained_models_improved")
REPORT_FILE = IMPROVED_DIR / "IMPROVEMENT_REPORT.md"
META_FILE = IMPROVED_DIR / "meta.json"

print("="*70)
print("TRAINING PROGRESS CHECK")
print("="*70)

if not IMPROVED_DIR.exists():
    print("\n⏳ Training in progress...")
    print("   The improved model directory hasn't been created yet.")
    print("   This means training is still running.")
    print("\n💡 Training typically takes 15-30 minutes")
    print("   Check back in a few minutes!")
    
elif not META_FILE.exists():
    print("\n⏳ Training in progress...")
    print("   Model directory exists but meta.json not saved yet.")
    print("   Training is in final stages.")
    
else:
    print("\n✅ TRAINING COMPLETE!")
    print("="*70)
    
    # Load metadata
    with open(META_FILE, 'r') as f:
        meta = json.load(f)
    
    # Extract metrics
    avg_conf = meta.get('metrics', {}).get('avg_confidence', 0)
    test_acc = meta.get('accuracies', {}).get('ensemble_test', 0) * 100
    high_conf_pct = meta.get('metrics', {}).get('high_confidence_pct', 0)
    f1 = meta.get('metrics', {}).get('f1_score', 0)
    
    print(f"\n📊 RESULTS:")
    print(f"   Average Confidence: {avg_conf:.1f}%")
    print(f"   Test Accuracy: {test_acc:.1f}%")
    print(f"   High Confidence (>=90%): {high_conf_pct:.1f}%")
    print(f"   F1-Score: {f1:.3f}")
    
    # Check if target met
    if avg_conf >= 90:
        print(f"\n🎉 SUCCESS! Target achieved!")
        print(f"   Confidence: {avg_conf:.1f}% >= 90% ✅")
        print(f"\n✅ Ready to deploy:")
        print(f"   python deploy_improved_tess.py")
    elif avg_conf >= 85:
        print(f"\n⚠️ Close to target!")
        print(f"   Confidence: {avg_conf:.1f}% (target: 90%)")
        print(f"   Consider deploying or retraining")
    else:
        print(f"\n⚠️ Below target")
        print(f"   Confidence: {avg_conf:.1f}% < 90%")
        print(f"   Consider:")
        print(f"   - Retraining (random variation may help)")
        print(f"   - Further hyperparameter tuning")
        print(f"   - Class reduction (6 → 4)")
    
    # Show report path
    if REPORT_FILE.exists():
        print(f"\n📄 Full Report:")
        print(f"   {REPORT_FILE}")
        print(f"\n   To read: cat {REPORT_FILE}")

print("\n" + "="*70)
