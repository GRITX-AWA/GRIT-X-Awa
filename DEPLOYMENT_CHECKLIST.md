# ✅ Deployment Checklist

Use this checklist to ensure your deployment is successful.

---

## 📦 Pre-Deployment

### Backend Preparation
- [ ] `backend/vercel.json` exists and configured
- [ ] `backend/.vercelignore` exists
- [ ] `backend/requirements.txt` includes `mangum==0.17.0`
- [ ] `backend/app/main.py` has `handler = Mangum(app, lifespan="off")` at the end
- [ ] All dependencies in `requirements.txt` are compatible with Vercel Python runtime
- [ ] Database migrations are ready (if applicable)
- [ ] ML model files are accessible (check size limits)

### Frontend Preparation
- [ ] `frontend/package.json` build script is correct
- [ ] `frontend/.env.example` is documented
- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] No hardcoded API URLs in code (use environment variables)

### Environment Variables Ready
- [ ] Backend `.env` file created locally (for testing)
- [ ] Frontend `.env` file created locally (for testing)
- [ ] All Supabase credentials available
- [ ] Database connection string tested

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment
- [ ] Navigated to `backend` directory
- [ ] Ran `vercel` command
- [ ] Project created in Vercel Dashboard
- [ ] Environment variables added in Vercel Dashboard:
  - [ ] `DATABASE_URL`
  - [ ] `PG_DISABLE_SSL_VERIFY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_BUCKET`
  - [ ] `DEBUG`
- [ ] Backend URL noted (e.g., `https://grit-x-awa-backend.vercel.app`)
- [ ] Backend health endpoint working (`/docs` accessible)

### Step 2: Frontend Deployment
- [ ] Navigated to `frontend` directory
- [ ] Ran `vercel` command
- [ ] Project created in Vercel Dashboard
- [ ] Environment variables added in Vercel Dashboard:
  - [ ] `VITE_API_URL` (set to backend Vercel URL)
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Frontend URL noted (e.g., `https://grit-x-awa-frontend.vercel.app`)
- [ ] Frontend loads successfully

### Step 3: Production Deployment
- [ ] Backend deployed to production: `cd backend && vercel --prod`
- [ ] Frontend deployed to production: `cd frontend && vercel --prod`

---

## 🧪 Post-Deployment Testing

### Backend Testing
- [ ] Visit backend URL + `/docs` to see API documentation
- [ ] Test health endpoint: `curl https://your-backend.vercel.app/api/health`
- [ ] Check Function Logs in Vercel Dashboard for errors
- [ ] Test database connection (check logs for connection errors)
- [ ] Test file upload endpoint (if applicable)

### Frontend Testing
- [ ] Frontend loads without errors
- [ ] Browser console shows no CORS errors
- [ ] API calls to backend working
- [ ] File upload functionality works
- [ ] ML model prediction works
- [ ] 3D visualizations render correctly
- [ ] Dark mode toggle works
- [ ] All pages accessible (Dashboard, Exoplanets, Visualizations)

### Integration Testing
- [ ] Upload CSV file in Dashboard
- [ ] Validate file columns correctly
- [ ] Run ML analysis successfully
- [ ] View results in Visualizations page
- [ ] Select exoplanet from Exoplanets page
- [ ] View 3D model in Visualizations page

---

## 🔧 Configuration Verification

### CORS Configuration
- [ ] Backend CORS allows frontend domain
- [ ] Frontend can make requests to backend
- [ ] No CORS errors in browser console

### Database Configuration
- [ ] Supabase database is accessible
- [ ] Connection string is correct
- [ ] SSL configuration is set (`PG_DISABLE_SSL_VERIFY=1`)
- [ ] Tables exist and are accessible
- [ ] Storage bucket exists and is accessible

### API Endpoints
Test these endpoints:
- [ ] `GET /docs` - API documentation
- [ ] `GET /api/health` - Health check
- [ ] `POST /predict` - Model prediction
- [ ] `GET /api/v1/models` - Get models
- [ ] Any other critical endpoints

---

## 🚨 Common Issues & Solutions

### Issue: "Internal Server Error" on backend
**Check:**
- [ ] Function logs in Vercel Dashboard
- [ ] All environment variables are set
- [ ] `DATABASE_URL` is correct
- [ ] Dependencies are compatible

### Issue: Frontend can't connect to backend
**Check:**
- [ ] `VITE_API_URL` is set correctly in frontend env vars
- [ ] CORS is configured correctly in backend
- [ ] Backend is actually deployed and running

### Issue: Database connection fails
**Check:**
- [ ] `DATABASE_URL` format is correct: `postgresql+asyncpg://...`
- [ ] `PG_DISABLE_SSL_VERIFY=1` is set
- [ ] Supabase database is not paused
- [ ] Credentials are correct

### Issue: File uploads fail
**Check:**
- [ ] Vercel has 4.5MB body size limit
- [ ] `SUPABASE_BUCKET` exists
- [ ] Storage permissions are correct
- [ ] Using proper upload method

### Issue: ML models not loading
**Check:**
- [ ] Model files are included in deployment
- [ ] Model files are not too large (Vercel limits)
- [ ] Model paths are correct
- [ ] Dependencies (tensorflow, keras) are installed

---

## 📊 Performance Checks

- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 2 seconds (after cold start)
- [ ] No console errors or warnings
- [ ] Mobile responsive design works
- [ ] Dark mode transitions smooth

---

## 🔐 Security Checks

- [ ] No API keys or secrets in frontend code
- [ ] Environment variables not exposed in frontend
- [ ] CORS not allowing all origins in production
- [ ] Database credentials secure
- [ ] Admin endpoints protected (if any)

---

## 📝 Documentation

- [ ] Update README.md with deployment URLs
- [ ] Document any manual configuration steps
- [ ] Note any known limitations
- [ ] Add contact info for support

---

## 🎉 Final Steps

- [ ] Test full user flow from start to finish
- [ ] Share URLs with team/stakeholders
- [ ] Monitor error logs for first 24 hours
- [ ] Set up Vercel alerts (optional)
- [ ] Celebrate successful deployment! 🚀🌌

---

## 📞 Need Help?

If you encounter issues:

1. Check [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions
2. Review Vercel Function Logs in the Dashboard
3. Check Vercel documentation: https://vercel.com/docs
4. Review FastAPI deployment docs: https://fastapi.tiangolo.com/deployment/

---

**Deployment Date:** _______________
**Backend URL:** _______________
**Frontend URL:** _______________
**Deployed By:** _______________

**Status:** ⬜ In Progress | ⬜ Completed | ⬜ Issues Found

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________
