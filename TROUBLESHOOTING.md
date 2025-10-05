# 🔧 Troubleshooting Guide - Upload & Analysis Issues

## Problem: "Upload failed: Failed to fetch"

### Root Causes & Solutions

#### 1. **Frontend Not Connected to Backend** ⚡ MOST COMMON

**Symptom:** You see "Failed to fetch" or "Network Connection Failed" error

**Cause:** Frontend is trying to connect to `localhost:8000` but backend is deployed on Google Cloud Run

**Solution:**

**Option A - Use Production Backend (Recommended):**
```bash
# Frontend already configured to use production by default
# Check frontend/src/services/api.ts line 2:
# API_BASE_URL = 'https://grit-x-awa-1035421252747.europe-west1.run.app'
```

**Option B - Run Backend Locally:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Then create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

---

#### 2. **Request Timeout (Large Files)** ⏱️

**Symptom:** Error after ~2 minutes: "Upload timeout: Processing is taking longer than expected"

**Cause:** Large CSV files (>5000 rows) take time to:
- Upload to Supabase
- Validate & preprocess data
- Run 3 ML models (CatBoost, XGBoost, LightGBM)
- Save predictions to database

**Solution:**
- ✅ **Timeout now extended to 5 minutes** (was 2 minutes before)
- For very large files, split into smaller batches (<5000 rows each)
- Check "Recent Predictions" - the job may have completed even if frontend timed out

---

#### 3. **Backend Server Not Running**

**Symptom:** "Network Connection Failed" with details about server not running

**Check if Backend is Running:**

**Production (Google Cloud Run):**
```bash
# Test the production API
curl https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/docs

# Or open in browser to see API documentation
```

**Local:**
```bash
# Check if backend is running on port 8000
curl http://localhost:8000/api/v1/docs
```

**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

---

#### 4. **Invalid CSV Format**

**Symptom:** "Invalid File or Data: CSV processing error: Cannot determine dataset type"

**Cause:** CSV file doesn't have required columns for Kepler or TESS models

**Required Columns:**

**Kepler (need at least 10 of these):**
- koi_pdisposition, koi_score, koi_fpflag_nt, koi_fpflag_ss
- koi_fpflag_co, koi_fpflag_ec, koi_period, koi_impact
- koi_duration, koi_depth, koi_prad, koi_teq, koi_insol
- koi_model_snr, koi_tce_plnt_num, koi_steff, koi_slogg
- koi_srad, ra, dec, koi_kepmag

**TESS (need at least 10 of these):**
- ra, dec, st_teff, st_logg, st_rad, st_dist
- st_pmra, st_pmdec, st_tmag, pl_orbper, pl_rade
- pl_trandep, pl_trandurh, pl_eqt, pl_insol

**Solution:**
- Ensure your CSV has a header row with correct column names
- Column names are case-sensitive
- Must match at least 10 features from either Kepler or TESS dataset

---

#### 5. **Supabase Connection Issues**

**Symptom:** Backend logs show "Supabase not configured" warnings

**Impact:** Predictions work but results aren't saved to database

**Check Environment Variables:**
```bash
# In backend/.env file, verify these are set:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Note:** Predictions will still return to frontend even if Supabase saving fails

---

#### 6. **CORS Issues (Cross-Origin)**

**Symptom:** Console shows CORS error when trying to connect to backend

**Solution:** Backend already configured to allow all origins for development:
```python
# backend/app/main.py - CORS is already configured
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If still seeing CORS issues, check:
1. Backend is actually running
2. URL in frontend matches backend URL exactly (no trailing slashes)

---

## Quick Diagnostic Steps

### Step 1: Check Backend Health
```bash
# Production
curl https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/docs

# Local
curl http://localhost:8000/api/v1/docs
```

### Step 2: Check Frontend Configuration
```bash
# In frontend/src/services/api.ts
# Should see: const API_BASE_URL = 'https://grit-x-awa-1035421252747.europe-west1.run.app'
```

### Step 3: Test Upload Endpoint Directly
```bash
# Create a small test CSV with Kepler columns
curl -X POST https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/upload/csv \
  -F "file=@test_kepler.csv"
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error details
4. Check Network tab for failed requests

---

## Error Message Reference

| Error Message | Status Code | Cause | Solution |
|--------------|-------------|-------|----------|
| "Failed to fetch" | - | Backend not reachable | Check API_BASE_URL and backend status |
| "Request Timeout" | - | Processing >5 min | Split file or wait for job to complete |
| "Network Connection Failed" | - | Network or CORS issue | Check internet, backend running, CORS |
| "Invalid File or Data" | 400 | Bad CSV format | Verify column names match Kepler/TESS |
| "Server Processing Error" | 500 | Backend crash | Check backend logs for details |
| "API Endpoint Not Found" | 404 | Wrong URL or backend not deployed | Verify API URL correct |

---

## Still Having Issues?

1. **Check Backend Logs:**
   ```bash
   # Google Cloud Run
   gcloud run services logs tail grit-x-awa --region europe-west1

   # Local
   # Look at terminal where uvicorn is running
   ```

2. **Enable Verbose Logging:**
   Add to frontend for more details:
   ```javascript
   console.log('API_BASE_URL:', API_BASE_URL);
   console.log('Uploading to:', url);
   ```

3. **Test with Small File First:**
   - Create a CSV with just 10 rows
   - Verify it works before trying larger files

4. **Verify ML Models Loaded:**
   Check backend startup logs for:
   ```
   ✅ ML models (Kepler & TESS) preloaded successfully!
   ```

---

## Contact & Support

- **Backend Health Check:** Run `backend/health-check.ps1`
- **API Documentation:** https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/docs
- **Project Repository:** https://github.com/GRITX-AWA/GRIT-X-Awa
