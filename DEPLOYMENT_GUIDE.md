# 🚀 Deployment Guide - Frontend & Backend

## 📋 Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  USER BROWSER                                              │
│  └─> Frontend (Vercel - Static Site)                      │
│       └─> Calls API_BASE_URL                              │
│            └─> Backend (Google Cloud Run)                 │
│                 ├─> FastAPI Server                        │
│                 ├─> ML Models (~28MB Kepler + TESS)      │
│                 ├─> Supabase Integration                  │
│                 └─> Returns Predictions                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ **IMPORTANT: Vercel Limitations for ML Backend**

### **Why the Backend CAN'T Run on Vercel:**

| Issue | Vercel Serverless | Google Cloud Run | Impact |
|-------|------------------|------------------|---------|
| **Model Size** | 50MB limit | 10GB container limit | Kepler+TESS = ~56MB total |
| **Memory** | 1GB max | 2GB+ configurable | ML needs 2GB+ |
| **Execution Time** | 10-60 seconds | 300 seconds (5 min) | Large files need >2 min |
| **Cold Starts** | Every request | Minimized with min instances | Models load slowly |
| **Model Preloading** | Not possible | ✅ Loads on startup | Critical for performance |

### **Your ML Models:**
```bash
Kepler Models:  ~28MB total
  - cat_model.pkl:   6.4MB (CatBoost)
  - xgb_model.pkl:   6.4MB (XGBoost)
  - lgbm_model.pkl: 13.0MB (LightGBM)
  - imputer.pkl:     1.8MB (Preprocessing)

TESS Models:    ~28MB total
  - Similar structure

TOTAL:          ~56MB (exceeds Vercel 50MB limit)
```

### **Vercel Serverless Functions:**
- ❌ 50MB deployment size limit (you have 56MB)
- ❌ 10-60 second timeout (you need 5 minutes)
- ❌ 1GB memory max (ML needs 2GB+)
- ❌ No persistent model caching
- ❌ Cold start every request = slow

### **Google Cloud Run (Current):**
- ✅ 10GB container size (plenty of room)
- ✅ 5 minute timeout (perfect for large files)
- ✅ 2GB+ memory (configurable)
- ✅ Models preloaded at startup
- ✅ Fast predictions after warmup

---

## ✅ **Recommended Deployment (Current Setup)**

### **1. Frontend → Vercel**
**What:** Static Vite/React app
**Why:** Fast global CDN, free hosting, perfect for SPAs
**Size:** ~5-10MB

**Deploy:**
```bash
cd frontend
npm run build
vercel --prod
```

**Environment Variables (Vercel Dashboard):**
```env
VITE_API_URL=https://grit-x-awa-1035421252747.europe-west1.run.app
PUBLIC_SUPABASE_URL=https://nafpqdeyshrdstecqldc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### **2. Backend → Google Cloud Run**
**What:** FastAPI + ML models in Docker container
**Why:** Handles large ML models, long processing times
**Size:** ~500MB Docker image

**Deploy:**
```bash
cd backend
./deploy.sh
# Or
./deploy.ps1
```

**Already Deployed At:**
```
https://grit-x-awa-1035421252747.europe-west1.run.app
```

**Configuration:**
- Memory: 2GB
- CPU: 2 cores
- Timeout: 300 seconds (5 minutes)
- Min instances: 0 (scales to zero)
- Max instances: 10

---

## 🔧 **Alternative: Backend on Vercel (NOT RECOMMENDED)**

If you **really** want to try Vercel for backend, you'd need to:

### **Option A: Model Splitting (Complex)**
```bash
# Split models across multiple serverless functions
/api/predict-kepler  -> Loads only Kepler models
/api/predict-tess    -> Loads only TESS models
```

**Limitations:**
- Each function still limited to 50MB
- Still limited to 10-60 seconds (will timeout on large files)
- Cold starts on every request
- Much slower than Cloud Run

### **Option B: External Model Hosting**
```bash
# Store models in external storage
- Upload models to S3/Google Cloud Storage
- Download at runtime (adds 10-30s latency)
- Still limited by timeout
```

**Limitations:**
- Very slow first request
- Still timeout issues
- More complex architecture

---

## 🎯 **Best Practice: Hybrid Deployment (CURRENT)**

### **Frontend: Vercel**
✅ Fast global CDN
✅ Free tier sufficient
✅ Automatic HTTPS
✅ Easy deployment from Git

### **Backend: Google Cloud Run**
✅ Handles ML workloads
✅ 5-minute timeout
✅ Model preloading
✅ Auto-scaling
✅ Pay only for usage

### **Database: Supabase**
✅ PostgreSQL database
✅ File storage (CSV uploads)
✅ Real-time subscriptions
✅ Free tier sufficient

---

## 📝 **Deployment Checklist**

### **Frontend (Vercel)**
- [ ] Build succeeds: `npm run build`
- [ ] Set environment variable: `VITE_API_URL`
- [ ] Deploy: `vercel --prod`
- [ ] Test: Open Vercel URL
- [ ] Verify: Check Network tab → calls to Cloud Run URL

### **Backend (Google Cloud Run)**
- [ ] Docker builds: `docker build -t test .`
- [ ] Set environment variables in Cloud Run
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_ANON_KEY`
- [ ] Deploy: `./deploy.sh` or `./deploy.ps1`
- [ ] Health check: `./health-check.ps1`
- [ ] Test: Visit `/api/v1/docs`

### **Integration Test**
- [ ] Upload CSV via frontend
- [ ] Check Network tab for API calls
- [ ] Verify predictions display
- [ ] Check Supabase for saved data

---

## 🚨 **Common Issues**

### **"Failed to fetch" Error**
**Cause:** Frontend can't reach backend
**Fix:** Check `VITE_API_URL` in Vercel environment variables

### **"Request Timeout"**
**Cause:** Processing takes >5 minutes
**Fix:**
1. Split large files into smaller batches
2. Increase Cloud Run timeout (already at max 5 min)
3. Implement async job processing

### **Cold Start Slow**
**Cause:** First request loads models
**Fix:** Set Cloud Run min instances to 1 (costs ~$20/month)

### **CORS Errors**
**Cause:** Backend not allowing frontend origin
**Fix:** Backend already allows all origins (`allow_origins=["*"]`)

---

## 💰 **Cost Estimates (Monthly)**

### **Current Setup:**
```
Frontend (Vercel):        $0     (Free tier)
Backend (Cloud Run):      $5-15  (Pay per request)
Database (Supabase):      $0     (Free tier)
----------------------------------------
TOTAL:                    $5-15/month
```

### **If Using Min Instances = 1 (Always warm):**
```
Frontend (Vercel):        $0
Backend (Cloud Run):      $20-30  (Always running)
Database (Supabase):      $0
----------------------------------------
TOTAL:                    $20-30/month
```

---

## 📊 **Performance Comparison**

| Metric | Vercel Serverless | Cloud Run (Current) |
|--------|------------------|---------------------|
| **First Request** | 15-30s (cold start) | 2-5s (preloaded) |
| **Subsequent** | 10-20s (reload models) | 0.5-2s (cached) |
| **Large File (9564 rows)** | ❌ Timeout | ✅ 2-4 minutes |
| **Max Timeout** | 60s | 300s |
| **Memory Available** | 1GB | 2GB+ |

---

## ✅ **Conclusion: Keep Current Setup**

**Your current deployment is optimal:**

1. ✅ Frontend on Vercel - Fast, free, global CDN
2. ✅ Backend on Cloud Run - Handles ML workloads perfectly
3. ✅ Models preloaded - Fast predictions
4. ✅ 5-minute timeout - Handles large files
5. ✅ Auto-scaling - Pay only for usage

**Don't migrate backend to Vercel because:**
- ❌ Model size exceeds Vercel limits
- ❌ Timeout too short for ML processing
- ❌ No model preloading = slow every request
- ❌ More expensive for ML workloads

---

## 🔗 **Useful Links**

- **Frontend:** https://grit-x-awa.vercel.app (deploy here)
- **Backend:** https://grit-x-awa-1035421252747.europe-west1.run.app (keep here)
- **Backend API Docs:** https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/docs
- **Cloud Run Console:** https://console.cloud.google.com/run/detail/europe-west1/grit-x-awa
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🆘 **Need Help?**

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run backend health check: `./backend/health-check.ps1`
3. Check Cloud Run logs: `gcloud run services logs tail grit-x-awa --region europe-west1`
4. Test API directly: Visit `/api/v1/docs` endpoint
