"""
Deploy Improved TESS Model

This script:
1. Validates the improved model performance
2. Backs up current models
3. Deploys improved models to production
4. Runs validation tests
"""

import shutil
import json
from pathlib import Path
import sys

# Paths
BACKEND_DIR = Path(__file__).parent
IMPROVED_MODEL_DIR = BACKEND_DIR / "tess" / "trained_models_improved"
CURRENT_MODEL_DIR = BACKEND_DIR / "tess" / "trained_models"
BACKUP_DIR = BACKEND_DIR / "tess" / "trained_models_backup"

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def validate_improved_model():
    """Check if improved model exists and meets criteria"""
    print_header("STEP 1: Validate Improved Model")
    
    # Check if directory exists
    if not IMPROVED_MODEL_DIR.exists():
        print(f"❌ ERROR: Improved model directory not found!")
        print(f"   Expected: {IMPROVED_MODEL_DIR}")
        print(f"\n   Please run: python train_improved_tess_model.py")
        return False
    
    # Check if meta.json exists
    meta_file = IMPROVED_MODEL_DIR / "meta.json"
    if not meta_file.exists():
        print(f"❌ ERROR: meta.json not found in improved models!")
        return False
    
    # Load metadata
    with open(meta_file, 'r') as f:
        meta = json.load(f)
    
    # Extract metrics
    avg_conf = meta.get('metrics', {}).get('avg_confidence', 0)
    test_acc = meta.get('accuracies', {}).get('ensemble_test', 0)
    f1_score = meta.get('metrics', {}).get('f1_score', 0)
    
    print(f"\n📊 Improved Model Metrics:")
    print(f"   Average Confidence: {avg_conf:.1f}%")
    print(f"   Test Accuracy: {test_acc*100:.1f}%")
    print(f"   F1-Score: {f1_score:.3f}")
    
    # Check if model files exist
    required_files = [
        'cat_model.pkl',
        'xgb_model.pkl',
        'lgbm_model.pkl',
        'imputer.pkl',
        'target_le.pkl',
        'encoders.pkl',
        'meta.json'
    ]
    
    missing_files = []
    for file in required_files:
        if not (IMPROVED_MODEL_DIR / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ ERROR: Missing files: {', '.join(missing_files)}")
        return False
    
    print(f"\n✅ All model files present")
    
    # Validate confidence
    if avg_conf >= 90:
        print(f"\n🎉 SUCCESS! Confidence target achieved: {avg_conf:.1f}% >= 90%")
        return True
    elif avg_conf >= 85:
        print(f"\n⚠️ WARNING: Confidence close to target: {avg_conf:.1f}%")
        response = input("   Deploy anyway? (y/n): ")
        return response.lower() == 'y'
    else:
        print(f"\n❌ WARNING: Confidence below target: {avg_conf:.1f}% < 90%")
        print("   Consider further optimization before deployment")
        response = input("   Deploy anyway? (y/n): ")
        return response.lower() == 'y'

def backup_current_models():
    """Backup current production models"""
    print_header("STEP 2: Backup Current Models")
    
    if not CURRENT_MODEL_DIR.exists():
        print(f"⚠️ No current models found at {CURRENT_MODEL_DIR}")
        print(f"   Skipping backup...")
        return True
    
    # Remove old backup if exists
    if BACKUP_DIR.exists():
        print(f"   Removing old backup...")
        shutil.rmtree(BACKUP_DIR)
    
    # Create new backup
    print(f"   Backing up current models...")
    shutil.copytree(CURRENT_MODEL_DIR, BACKUP_DIR)
    
    print(f"✅ Current models backed up to: {BACKUP_DIR}")
    return True

def deploy_improved_models():
    """Replace current models with improved models"""
    print_header("STEP 3: Deploy Improved Models")
    
    # Remove current models
    if CURRENT_MODEL_DIR.exists():
        print(f"   Removing current models...")
        shutil.rmtree(CURRENT_MODEL_DIR)
    
    # Copy improved models to production
    print(f"   Deploying improved models...")
    shutil.copytree(IMPROVED_MODEL_DIR, CURRENT_MODEL_DIR)
    
    print(f"✅ Improved models deployed to: {CURRENT_MODEL_DIR}")
    return True

def validate_deployment():
    """Run validation tests"""
    print_header("STEP 4: Validate Deployment")
    
    # Check if meta.json is accessible
    meta_file = CURRENT_MODEL_DIR / "meta.json"
    if not meta_file.exists():
        print(f"❌ ERROR: Deployment failed - meta.json not found!")
        return False
    
    with open(meta_file, 'r') as f:
        meta = json.load(f)
    
    print(f"\n✅ Deployed model metadata:")
    print(f"   Features: {len(meta.get('feature_order', []))}")
    print(f"   Classes: {meta.get('class_names', [])}")
    print(f"   Weights: {meta.get('weights', [])}")
    print(f"   Test Accuracy: {meta.get('accuracies', {}).get('ensemble_test', 0)*100:.1f}%")
    print(f"   Avg Confidence: {meta.get('metrics', {}).get('avg_confidence', 0):.1f}%")
    
    # Suggest running integration tests
    print(f"\n📝 Next Steps:")
    print(f"   1. Run: python test_tess_prediction.py")
    print(f"   2. Test with real data")
    print(f"   3. Monitor production performance")
    print(f"   4. Compare with previous model metrics")
    
    return True

def rollback():
    """Rollback to backup if needed"""
    print_header("ROLLBACK: Restore Previous Models")
    
    if not BACKUP_DIR.exists():
        print(f"❌ ERROR: No backup found at {BACKUP_DIR}")
        return False
    
    # Remove current (failed) models
    if CURRENT_MODEL_DIR.exists():
        shutil.rmtree(CURRENT_MODEL_DIR)
    
    # Restore from backup
    shutil.copytree(BACKUP_DIR, CURRENT_MODEL_DIR)
    
    print(f"✅ Rolled back to previous models")
    return True

def main():
    """Main deployment pipeline"""
    print_header("TESS Model Deployment Pipeline")
    print("This will deploy the improved TESS model to production")
    
    try:
        # Step 1: Validate improved model
        if not validate_improved_model():
            print("\n❌ Deployment aborted - validation failed")
            sys.exit(1)
        
        # Step 2: Backup current models
        if not backup_current_models():
            print("\n❌ Deployment aborted - backup failed")
            sys.exit(1)
        
        # Step 3: Deploy improved models
        if not deploy_improved_models():
            print("\n❌ Deployment failed - attempting rollback...")
            rollback()
            sys.exit(1)
        
        # Step 4: Validate deployment
        if not validate_deployment():
            print("\n⚠️ Deployment validation warning")
            response = input("Continue? (y/n): ")
            if response.lower() != 'y':
                rollback()
                sys.exit(1)
        
        print_header("DEPLOYMENT SUCCESSFUL! 🎉")
        print("\n✅ Improved TESS model is now in production")
        print(f"✅ Previous models backed up to: {BACKUP_DIR}")
        print("\n📊 To verify:")
        print("   python test_tess_prediction.py")
        
    except Exception as e:
        print(f"\n❌ ERROR during deployment: {e}")
        print("\nAttempting rollback...")
        rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
