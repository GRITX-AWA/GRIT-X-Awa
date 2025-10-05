# Pre-Deployment Verification Script
# Run this before deploying to Google Cloud Run

Write-Host "`n PRE-DEPLOYMENT CHECKLIST`n" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Gray

$allGood = $true

# Check 1: Docker Desktop
Write-Host "`n1  Checking Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Docker Desktop is running" -ForegroundColor Green
    } else {
        Write-Host "    Docker Desktop is NOT running" -ForegroundColor Red
        Write-Host "       Start Docker Desktop and wait for green whale icon" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "    Docker Desktop is NOT running" -ForegroundColor Red
    Write-Host "       Start Docker Desktop and wait for green whale icon" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: gcloud CLI
Write-Host "`n2  Checking gcloud CLI..." -ForegroundColor Yellow
try {
    $gcloudVersion = gcloud --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    gcloud CLI is installed" -ForegroundColor Green
    } else {
        Write-Host "    gcloud CLI is NOT installed" -ForegroundColor Red
        Write-Host "       Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "    gcloud CLI is NOT installed" -ForegroundColor Red
    Write-Host "       Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    $allGood = $false
}

# Check 3: gcloud authentication
Write-Host "`n3  Checking gcloud authentication..." -ForegroundColor Yellow
try {
    $gcloudAuth = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>&1
    if ($gcloudAuth -and $gcloudAuth -notmatch "ERROR") {
        Write-Host "    Logged into gcloud as: $gcloudAuth" -ForegroundColor Green
    } else {
        Write-Host "    Not logged into gcloud" -ForegroundColor Red
        Write-Host "       Run: gcloud auth login" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "    Not logged into gcloud" -ForegroundColor Red
    Write-Host "       Run: gcloud auth login" -ForegroundColor Yellow
    $allGood = $false
}

# Check 4: .env file
Write-Host "`n4  Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "    .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env" -Raw
    $hasSupabaseUrl = $envContent -match "SUPABASE_URL="
    $hasServiceKey = $envContent -match "SUPABASE_SERVICE_ROLE_KEY="
    $hasAnonKey = $envContent -match "SUPABASE_ANON_KEY="
    
    if ($hasSupabaseUrl -and $hasServiceKey -and $hasAnonKey) {
        Write-Host "    All required environment variables present" -ForegroundColor Green
    } else {
        Write-Host "     Some environment variables may be missing:" -ForegroundColor Yellow
        if (-not $hasSupabaseUrl) { Write-Host "      - SUPABASE_URL" -ForegroundColor Red }
        if (-not $hasServiceKey) { Write-Host "      - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red }
        if (-not $hasAnonKey) { Write-Host "      - SUPABASE_ANON_KEY" -ForegroundColor Red }
    }
} else {
    Write-Host "    .env file NOT found" -ForegroundColor Red
    Write-Host "       Create .env file with Supabase credentials" -ForegroundColor Yellow
    $allGood = $false
}

# Check 5: ML Model files
Write-Host "`n5  Checking ML model files..." -ForegroundColor Yellow
$keplerExists = Test-Path "kepler/meta.json"
$tessExists = Test-Path "tess/meta.json"

if ($keplerExists -and $tessExists) {
    Write-Host "    Kepler models found" -ForegroundColor Green
    Write-Host "    TESS models found" -ForegroundColor Green
} else {
    if (-not $keplerExists) {
        Write-Host "    Kepler models NOT found" -ForegroundColor Red
    }
    if (-not $tessExists) {
        Write-Host "    TESS models NOT found" -ForegroundColor Red
    }
    Write-Host "       Ensure model .pkl files are in kepler/ and tess/ directories" -ForegroundColor Yellow
    $allGood = $false
}

# Check 6: Project configuration
Write-Host "`n6  Checking project configuration..." -ForegroundColor Yellow
$projectId = "grit-x-awa-1035421252747"
try {
    $currentProject = gcloud config get-value project 2>&1
    if ($currentProject -eq $projectId) {
        Write-Host "    Project set correctly: $projectId" -ForegroundColor Green
    } else {
        Write-Host "     Current project: $currentProject" -ForegroundColor Yellow
        Write-Host "      Will be set to: $projectId during deployment" -ForegroundColor Yellow
    }
} catch {
    Write-Host "     Could not check project configuration" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -ForegroundColor Gray
if ($allGood) {
    Write-Host "`n ALL CHECKS PASSED! Ready to deploy!" -ForegroundColor Green
    Write-Host "`n Run deployment:" -ForegroundColor Cyan
    Write-Host "   .\deploy.ps1`n" -ForegroundColor Yellow
} else {
    Write-Host "`n SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "`n  Fix the issues above before deploying" -ForegroundColor Yellow
    Write-Host "`n Need help?" -ForegroundColor Cyan
    Write-Host "   Read: GOOGLE_CLOUD_CONSOLE_SETUP.md" -ForegroundColor White
    Write-Host "   Read: DOCKER_TROUBLESHOOTING.md`n" -ForegroundColor White
}

Write-Host "`n" -ForegroundColor Gray