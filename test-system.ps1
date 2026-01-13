# System Health Check Script (PowerShell)
# Tests that all critical endpoints are working

Write-Host "Testing Recruitment Management System..." -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedCode
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode

        if ($statusCode -eq $ExpectedCode) {
            Write-Host "PASS: $Name (HTTP $statusCode)" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "FAIL: $Name (Expected $ExpectedCode, got $statusCode)" -ForegroundColor Red
            $script:failed++
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedCode) {
            Write-Host "PASS: $Name (HTTP $statusCode)" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "FAIL: $Name (Expected $ExpectedCode, got $statusCode or error)" -ForegroundColor Red
            $script:failed++
        }
    }
}

# Test Backend
Write-Host "Backend Tests:" -ForegroundColor Yellow
Test-Endpoint -Name "Health Check" -Url "http://localhost:3000/health" -ExpectedCode 200
Test-Endpoint -Name "Public Vacancies" -Url "http://localhost:3000/api/public/vacancies" -ExpectedCode 200

# Test Frontend
Write-Host ""
Write-Host "Frontend Tests:" -ForegroundColor Yellow
# Try multiple ports as Vite may use different ports
$frontendPorts = @(5173, 5174, 5175, 5176)
$frontendWorking = $false
foreach ($port in $frontendPorts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method Get -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS: Frontend Home (HTTP 200 on port $port)" -ForegroundColor Green
            $passed++
            $frontendWorking = $true
            break
        }
    }
    catch {
        # Try next port
    }
}
if (-not $frontendWorking) {
    Write-Host "FAIL: Frontend not accessible on any port (5173-5176)" -ForegroundColor Red
    $failed++
}

# Test Login
Write-Host ""
Write-Host "Authentication Test:" -ForegroundColor Yellow

try {
    $loginBody = @{
        email = "admin@recruitment.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    if ($loginResponse.token) {
        Write-Host "PASS: Login successful (token received)" -ForegroundColor Green
        $passed++
    }
    else {
        Write-Host "FAIL: Login failed (no token in response)" -ForegroundColor Red
        $failed++
    }
}
catch {
    Write-Host "FAIL: Login failed (error: $($_.Exception.Message))" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Some tests failed" -ForegroundColor Red
    exit 1
}

