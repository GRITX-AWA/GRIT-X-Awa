# 🚀 Vercel Deployment Guide - GRIT-X-Awa Exoplanet App

Complete guide to deploy both frontend and backend on Vercel.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Testing Deployment](#testing-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ A [Vercel account](https://vercel.com/signup) (free tier works fine)
- ✅ [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- ✅ Git repository pushed to GitHub/GitLab/Bitbucket
- ✅ Supabase account with database configured
- ✅ All environment variables ready

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

---

## 🎨 Frontend Deployment

### Step 1: Prepare Frontend

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Test build locally:**

```bash
npm run build
```

### Step 2: Deploy Frontend to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → `grit-x-awa-frontend` (or your choice)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**

### Step 3: Configure Frontend Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔥 Backend Deployment (FastAPI on Vercel)

### Step 1: Prepare Backend for Vercel

Vercel uses **serverless functions**, so we need to adapt the FastAPI app.

#### 1.1 Create `vercel.json` in backend directory

```bash
cd backend
```

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  }
}
```

#### 1.2 Create `requirements.txt` (if not exists)

Make sure your `backend/requirements.txt` includes:

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
asyncpg==0.29.0
supabase==2.0.0
python-multipart==0.0.6
python-dotenv==1.0.0
```

#### 1.3 Modify `main.py` for Vercel

Update your `backend/app/main.py` to be compatible with Vercel:

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum  # Add this import
from app.core.config import settings
# ... other imports

app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of your routes

# Add this at the end for Vercel
handler = Mangum(app)
```

#### 1.4 Install Mangum (ASGI adapter for serverless)

```bash
pip install mangum
```

Add to `requirements.txt`:

```txt
mangum==0.17.0
```

### Step 2: Deploy Backend to Vercel

#### Option A: Using Vercel CLI

```bash
cd backend
vercel
```

Follow the prompts:
- **Project name?** → `grit-x-awa-backend`
- **Root Directory:** `./`

#### Option B: Using Vercel Dashboard

1. Go to Vercel Dashboard → **Add New Project**
2. Import repository
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
4. Deploy

### Step 3: Configure Backend Environment Variables

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

```env
DATABASE_URL=postgresql+asyncpg://postgres:your-password@db.your-project.supabase.co:5432/postgres
PG_DISABLE_SSL_VERIFY=1
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=exoplanet_csvs
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Step 4: Alternative - Backend with Custom Python Runtime

If the above doesn't work, try this approach:

#### Create `api/index.py`

```bash
mkdir -p backend/api
```

Create `backend/api/index.py`:

```python
from app.main import app

# Vercel serverless entry point
def handler(request):
    return app(request)
```

Update `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

---

## 🔐 Environment Variables

### Frontend Environment Variables

Create `.env` in `frontend/`:

```env
VITE_API_URL=https://grit-x-awa-backend.vercel.app
VITE_SUPABASE_URL=https://nafpqdeyshrdstecqldc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend Environment Variables

Create `.env` in `backend/` (for local development):

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:your-password@db.nafpqdeyshrdstecqldc.supabase.co:5432/postgres
PG_DISABLE_SSL_VERIFY=1

# Supabase
SUPABASE_URL=https://nafpqdeyshrdstecqldc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=exoplanet_csvs

# API Config
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

**⚠️ IMPORTANT:** Add these same variables to Vercel Dashboard for production!

---

## 🗄️ Database Setup (Supabase)

Your Supabase database is already configured. Ensure:

1. **Database is accessible:**
   - Connection string is correct
   - SSL is configured (`PG_DISABLE_SSL_VERIFY=1`)

2. **Storage bucket exists:**
   - Bucket name: `exoplanet_csvs`
   - Public access if needed

3. **Tables are created:**
   - Run migrations if you have any
   - Ensure schema matches your models

---

## 🧪 Testing Deployment

### Test Frontend

1. Visit your Vercel frontend URL: `https://grit-x-awa-frontend.vercel.app`
2. Check browser console for errors
3. Test API connection

### Test Backend

1. Visit backend URL: `https://grit-x-awa-backend.vercel.app`
2. Test API endpoints:

```bash
curl https://grit-x-awa-backend.vercel.app/api/health
```

3. Check logs in Vercel Dashboard → Your Project → Deployments → View Function Logs

### Test Full Integration

1. Upload a CSV file in the frontend
2. Run ML analysis
3. Check if data flows correctly

---

## 🚨 Troubleshooting

### Issue: Backend "Internal Server Error"

**Solution:**
- Check Function Logs in Vercel Dashboard
- Verify environment variables are set correctly
- Ensure `requirements.txt` has all dependencies

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt
pip freeze > requirements.txt
vercel --prod
```

### Issue: Database connection timeout

**Solution:**
- Verify `DATABASE_URL` is correct
- Check Supabase firewall settings
- Ensure `PG_DISABLE_SSL_VERIFY=1` is set

### Issue: CORS errors in frontend

**Solution:**
Update `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://grit-x-awa-frontend.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Cold start delays

**Explanation:** Serverless functions have cold starts (2-5 seconds first request)

**Solution:**
- Use Vercel Pro plan for better performance
- Implement warming strategy (periodic health checks)

### Issue: File upload size limits

**Solution:**
- Vercel has 4.5MB body size limit for serverless functions
- For larger files, use direct Supabase storage upload from frontend

---

## 📚 Additional Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Docs](https://supabase.com/docs)

---

## 🔄 Continuous Deployment

Once connected to Git:

1. **Automatic deploys on push:**
   - Push to `main` → Auto deploy to production
   - Push to other branches → Deploy preview

2. **Manual redeployment:**
   ```bash
   vercel --prod
   ```

3. **Rollback if needed:**
   - Vercel Dashboard → Deployments → Select previous → Promote to Production

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] All environment variables documented
- [ ] Database credentials ready
- [ ] `requirements.txt` up to date
- [ ] `vercel.json` configured
- [ ] CORS settings updated
- [ ] API endpoints tested locally

### After Deploying:
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] File uploads work
- [ ] ML model endpoints functional
- [ ] Error handling working
- [ ] Production URLs updated in environment variables

---

## 🎉 Success!

Once deployed, your app will be live at:
- **Frontend:** `https://grit-x-awa-frontend.vercel.app`
- **Backend:** `https://grit-x-awa-backend.vercel.app`

Remember to update the frontend `.env` with the actual backend URL!

---

**Need help?** Check Vercel logs or create an issue in the repository.

**Happy Deploying! 🚀🌌**
