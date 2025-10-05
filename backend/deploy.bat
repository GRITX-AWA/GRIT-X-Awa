@echo off
echo ========================================
echo   🚀 Deploying GRIT-X-Awa Backend
echo   Google Cloud Run + Supabase
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo.
    echo Please create backend/.env with Supabase credentials
    pause
    exit /b 1
)

echo 📁 Loading Supabase credentials from .env...

REM Read values from .env (simple parsing)
for /f "tokens=1,2 delims==" %%a in ('findstr /r "^SUPABASE_URL=" .env') do set SUPABASE_URL=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr /r "^SUPABASE_ANON_KEY=" .env') do set SUPABASE_ANON_KEY=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr /r "^SUPABASE_SERVICE_ROLE_KEY=" .env') do set SUPABASE_SERVICE_ROLE_KEY=%%b

echo ✅ Loaded credentials
echo.
echo 🔧 Supabase URL: %SUPABASE_URL%
echo.

echo 🚀 Submitting build to Google Cloud...
echo.

gcloud builds submit --config=cloudbuild.yaml ^
  --substitutions=_SUPABASE_URL="%SUPABASE_URL%",_SUPABASE_SERVICE_ROLE_KEY="%SUPABASE_SERVICE_ROLE_KEY%",_SUPABASE_ANON_KEY="%SUPABASE_ANON_KEY%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ Deployment Successful!
    echo ========================================
    echo.
    echo Your backend is now live on Cloud Run
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ Deployment Failed
    echo ========================================
    echo.
    echo Check the error messages above
    echo.
)

pause
