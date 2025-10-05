# Google Cloud Run Deployment Script for PowerShell
# Usage: .\deploy.ps1 [-ProjectId "your-project-id"] [-Region "europe-west1"]

param(
    [string]$ProjectId = "grit-x-awa",
    [string]$Region = "europe-west1"
)

$ErrorActionPreference = "Stop"

$ServiceName = "grit-x-awa"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "Starting deployment to Google Cloud Run" -ForegroundColor Blue
Write-Host "Project: $ProjectId" -ForegroundColor Blue
Write-Host "Region: $Region" -ForegroundColor Blue
Write-Host ""

# Check if gcloud is installed
try {
    gcloud --version | Out-Null
} catch {
    Write-Host "gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Blue
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Get environment variables
$SupabaseUrl = $env:SUPABASE_URL
$SupabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$SupabaseAnonKey = $env:SUPABASE_ANON_KEY
$DatabaseUrl = $env:DATABASE_URL
$PgDisableSslVerify = $env:PG_DISABLE_SSL_VERIFY

# Validate required environment variables
if (-not $DatabaseUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env file!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add DATABASE_URL to your .env file with your Supabase PostgreSQL connection string:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Go to Settings > Database" -ForegroundColor White
    Write-Host "  4. Copy the Connection String (URI format)" -ForegroundColor White
    Write-Host "  5. Add to .env: DATABASE_URL=postgresql://..." -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Set the project
Write-Host "Setting project..." -ForegroundColor Blue
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Blue
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Blue
docker build -t "${ImageName}:latest" .

# Tag with timestamp
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker tag "${ImageName}:latest" "${ImageName}:${Timestamp}"

# Push to Google Container Registry
Write-Host "Pushing image to GCR..." -ForegroundColor Blue
docker push "${ImageName}:latest"
docker push "${ImageName}:${Timestamp}"

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $ServiceName --image "${ImageName}:latest" --platform managed --region $Region --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 300 --max-instances 10 --min-instances 0 --set-env-vars "DATABASE_URL=$DatabaseUrl,SUPABASE_URL=$SupabaseUrl,SUPABASE_SERVICE_ROLE_KEY=$SupabaseServiceKey,SUPABASE_ANON_KEY=$SupabaseAnonKey,PG_DISABLE_SSL_VERIFY=$PgDisableSslVerify"

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'

Write-Host ""
Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Service URL: $ServiceUrl" -ForegroundColor Green
Write-Host "API Docs: $ServiceUrl/api/v1/docs" -ForegroundColor Green
Write-Host ""
