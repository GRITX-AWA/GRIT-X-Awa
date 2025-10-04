# 🚀 Quick Start Deployment Guide

## Prerequisites

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

## Deploy Backend

```bash
cd backend
vercel
```

**First time prompts:**
- Project name: `grit-x-awa-backend`
- Directory: `./`
- Settings override: No

**Set environment variables in Vercel Dashboard:**
```
DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
PG_DISABLE_SSL_VERIFY=1
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_BUCKET=exoplanet_csvs
DEBUG=False
```

## Deploy Frontend

```bash
cd frontend
vercel
```

**First time prompts:**
- Project name: `grit-x-awa-frontend`
- Framework: Vite
- Directory: `./`

**Set environment variables in Vercel Dashboard:**
```
VITE_API_URL=https://grit-x-awa-backend.vercel.app
VITE_SUPABASE_URL=https://PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Production Deployment

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

## Check Deployment

- Frontend: `https://grit-x-awa-frontend.vercel.app`
- Backend: `https://grit-x-awa-backend.vercel.app/docs`

## Troubleshooting

**View logs:**
```bash
vercel logs [deployment-url]
```

**Redeploy:**
```bash
vercel --force
```

**List deployments:**
```bash
vercel ls
```

For detailed guide, see [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
