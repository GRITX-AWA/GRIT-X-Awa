# Health Check Script for Cloud Run Deployment
# Usage: .\health-check.ps1 -ServiceUrl "https://your-service-url.run.app"

param(
    [Parameter(Mandatory=$false)]
    [string]$ServiceUrl,
    [string]$ProjectId = "grit-x-awa-1035421252747",
    [string]$Region = "europe-west1"
)

$ErrorActionPreference = "Continue"

Write-Host "🏥 Cloud Run Health Check" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host ""

# If no URL provided, get it from gcloud
if (-not $ServiceUrl) {
    Write-Host "📋 Fetching service URL from Cloud Run..." -ForegroundColor Yellow
    try {
        $ServiceUrl = gcloud run services describe grit-x-awa `
            --platform managed `
            --region $Region `
            --format 'value(status.url)' 2>$null
        
        if ($ServiceUrl) {
            Write-Host "✅ Found service URL: $ServiceUrl" -ForegroundColor Green
        } else {
            Write-Host "❌ Service not found. Please deploy first or provide URL manually." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Could not fetch service URL. Is the service deployed?" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Test 1: Root endpoint
Write-Host "Test 1: Root endpoint" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $ServiceUrl -Method Get -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Root endpoint is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Docs
Write-Host "Test 2: API Documentation" -ForegroundColor Cyan
try {
    $docsUrl = "$ServiceUrl/api/v1/docs"
    $response = Invoke-WebRequest -Uri $docsUrl -Method Get -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ API docs are accessible" -ForegroundColor Green
        Write-Host "  📚 Docs URL: $docsUrl" -ForegroundColor Blue
    }
} catch {
    Write-Host "  ❌ API docs failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: OpenAPI Schema
Write-Host "Test 3: OpenAPI Schema" -ForegroundColor Cyan
try {
    $openApiUrl = "$ServiceUrl/openapi.json"
    $response = Invoke-RestMethod -Uri $openApiUrl -Method Get -TimeoutSec 30
    if ($response) {
        Write-Host "  ✅ OpenAPI schema is available" -ForegroundColor Green
        $endpoints = $response.paths.PSObject.Properties.Name.Count
        Write-Host "  📊 Found $endpoints endpoints" -ForegroundColor Blue
    }
} catch {
    Write-Host "  ⚠️  OpenAPI schema check skipped" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Check specific endpoints exist
Write-Host "Test 4: Endpoint Availability" -ForegroundColor Cyan
$endpoints = @(
    "/predict",
    "/train",
    "/stats",
    "/models",
    "/data"
)

foreach ($endpoint in $endpoints) {
    try {
        $url = "$ServiceUrl$endpoint"
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 15 -SkipHttpErrorCheck
        $status = $response.StatusCode
        
        if ($status -eq 200 -or $status -eq 405) {  # 405 means method not allowed but endpoint exists
            Write-Host "  ✅ $endpoint (Status: $status)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $endpoint (Status: $status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ $endpoint - Failed" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Response Time
Write-Host "Test 5: Response Time" -ForegroundColor Cyan
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$ServiceUrl/api/v1/docs" -Method Get -TimeoutSec 30
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 1000) {
        Write-Host "  ✅ Fast response: ${responseTime}ms (warm instance)" -ForegroundColor Green
    } elseif ($responseTime -lt 5000) {
        Write-Host "  ✅ Good response: ${responseTime}ms" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Slow response: ${responseTime}ms (possible cold start)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Response time test failed" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "=========================" -ForegroundColor Blue
Write-Host "📊 Health Check Summary" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host "Service URL: $ServiceUrl" -ForegroundColor White
Write-Host "API Docs:    $ServiceUrl/api/v1/docs" -ForegroundColor White
Write-Host ""

# Quick links
Write-Host "🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "  • API Documentation: $ServiceUrl/api/v1/docs" -ForegroundColor Blue
Write-Host "  • ReDoc: $ServiceUrl/api/v1/redoc" -ForegroundColor Blue
Write-Host "  • Cloud Console: https://console.cloud.google.com/run/detail/$Region/grit-x-awa" -ForegroundColor Blue
Write-Host ""

# Logs command
Write-Host "📝 To view logs, run:" -ForegroundColor Cyan
Write-Host "  gcloud run services logs tail grit-x-awa --region $Region" -ForegroundColor White
Write-Host ""

# Final status
Write-Host "✅ Health check complete!" -ForegroundColor Green
Write-Host ""
