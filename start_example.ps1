# Set API Configuration
$EnableSLA = $true  # Set to $false to disable SLA monitoring

Write-Host "Setting up environment variables..." -ForegroundColor Cyan

# SLA logging
$env:ENABLE_SLA_LOGS = if (-not $EnableSLA) { 'false' } else { 'true' }
$env:SLA_RESPONSE_TIME="1.6"  # seconds
$env:SSL_EXPIRY_THRESHOLD="210"  # Days before SSL expiration to trigger alert
$env:ITERATION = "2" # minutes
$env:LOG_EXPIRY="6" # days of logs to keep

# SLA - Handle iteration timing (default 30 minutes if not specified)
if (-not $env:ITERATION) {    
    Write-Host "No iteration time specified. Using default: 30 minutes" -ForegroundColor Yellow
} else {
    Write-Host "Using specified iteration time: $env:ITERATION minutes" -ForegroundColor Cyan
}

# Skip port checking in container mode
if (-not $inContainer) {
    # Check if port 3000 is in use
    $portInUse = Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "Port 3000 is already in use. Attempting to free it..." -ForegroundColor Yellow
        try {
            $processId = $portInUse.OwningProcess
            Stop-Process -Id $processId -Force
            Write-Host "Successfully freed port 3000" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "Failed to free port 3000. Please ensure no other application is using it." -ForegroundColor Red
            exit 1
        }
    }
    
    # Check if port 3001 is in use (SLA Monitor)
    $slaPortInUse = Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue
    if ($slaPortInUse) {
        Write-Host "Port 3001 is already in use. Attempting to free it..." -ForegroundColor Yellow
        try {
            $processId = $slaPortInUse.OwningProcess
            Stop-Process -Id $processId -Force
            Write-Host "Successfully freed port 3001" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "Failed to free port 3001. Please ensure no other application is using it." -ForegroundColor Red
            exit 1
        }
    }
    
    # Check if port 8080 is in use
    $webPortInUse = Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($webPortInUse) {
        Write-Host "Port 8080 is already in use. Attempting to free it..." -ForegroundColor Yellow
        try {
            $processId = $webPortInUse.OwningProcess
            Stop-Process -Id $processId -Force
            Write-Host "Successfully freed port 8080" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "Failed to free port 8080. Please ensure no other application is using it." -ForegroundColor Red
            exit 1
        }
    }
}

# Environment Variables - Replace with your actual URLs
$env:BASE_URL = "https://api-staging.example.com/staging/"
$env:STAGING = "https://api-staging.example.com/staging/"
$env:BETA = "https://api-beta.example.com/beta/"
$env:MUFASA = "https://api-mufasa.example.com/mufasa/"
$env:SHAZAM = "https://api-shazam.example.com/shazam/"
$env:MADEYE = "https://api-madeye.example.com/madeye/"
$env:SANDBOX = "https://api-sandbox.example.com/sandbox/"

# SLA Environment Variables
# Mock Server
# $env:BASE_URL_SLA_US = "http://localhost:3003"

# US
$env:BASE_URL_SLA_US = "https://api-staging.example.com/staging/"
$env:BASE_URL_PHI_SLA_US = "https://api-staging.example.com/staging/"
$env:PHI_API_KEY_US = "your-us-phi-api-key-here"

# EU
$env:BASE_URL_SLA_EU = "https://api-staging.example.com/staging/"
$env:BASE_URL_PHI_SLA_EU = "https://dev.api.example.com/staging/"
$env:PHI_API_KEY_EU = "your-eu-phi-api-key-here"

# Slack Configuration for SLA - Replace with your webhook URL
$env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
$env:SLACK_SUBTEAM_ID = ""  # SLA monitor group ID, leave empty to disable mentions

# Amazon S3 - Replace with your S3 bucket URLs
$env:BASE_URL_ATTACHMENTS = "https://your-staging-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_STAGING = "https://your-staging-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_BETA = "https://your-beta-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_MUFASA = "https://your-mufasa-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_SHAZAM = "https://your-shazam-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_MADEYE = "https://your-madeye-attachments.s3.amazonaws.com/"
$env:UPLOAD_ATTACHMENTS_SANDBOX = "https://your-sandbox-attachments.s3.amazonaws.com/"

# PHI - Replace with your PHI URLs
$env:BASE_URL_PHI = "https://dev.api.example.com/staging/"
$env:PHI_URL_STAGING = "https://dev.api.example.com/staging/"
$env:PHI_URL_PREPROD = "https://api.us.example.com/preprod/"

# Set environment variables - Replace with your actual values
$env:PAPI_VERSION = "F2.1.0/T1.7.0/S1.8.0"
$env:GLASSESON_CLIENT_ID = "your-client-id-here"
$env:GLASSESON_PROFILE_NAME = "native_goeyes"
$env:GLASSESON_NATIVE_APP_ID = "com.example.app"
$env:GLASSESON_FLOW_ID = "go-eyes"
$env:GLASSESON_USER_ID = "your-user-id-here"

# GoEyes-LM
$env:GLASSESON_CLIENT_ID_LM = "your-lm-client-id-here"
$env:GLASSESON_PROFILE_NAME_LM = "go_eyes_lm"
$env:GLASSESON_NATIVE_APP_ID_LM = "com.example.wrapper"
$env:GLASSESON_FLOW_ID_LM = "go-eyes-lm"
$env:GLASSESON_USER_ID_LM = "your-lm-user-id-here"

# Attachments
$env:GLASSESON_NATIVE_APP_ID_ATTACHMENTS = "com.example.wrapper"
$env:GLASSESON_SESSION_ID_ATTACHMENTS = "aaaaaaaa-bbbb-cccc-dddd"
$env:GLASSESON_SAVE_ID_ATTACHMENTS = "tteeeeee-ffff-gggg-hhhh"
$env:GLASSESON_FILE_TYPE_ATTACHMENTS = "csv"
$env:X_API_KEY = "your-x-api-key-here"

# PHI API Keys - Replace with your actual keys
$env:PHI_API_KEY = "your-phi-api-key-here"
$env:PHI_API_KEY_PREPROD = "your-preprod-phi-api-key-here"
$env:PHI_API_KEY_STAGING = "your-staging-phi-api-key-here"

# PD
$env:GLASSESON_CLIENT_ID_PD = "your-pd-client-id-here"
$env:GLASSESON_PROFILE_NAME_PD = "web"
$env:GLASSESON_REFERER_PD = "https://web.example.com"
$env:GLASSESON_NATIVE_APP_ID_PD_NATIVE = "com.example.sdktester"
$env:GLASSESON_PROFILE_NAME_PD_NATIVE = "go_lenses" 
$env:GLASSESON_FLOW_ID_PD = "pd"

# VA
$env:GLASSESON_CLIENT_ID_VA = "your-va-client-id-here"
$env:GLASSESON_PROFILE_NAME_VA = "va_web"
$env:GLASSESON_REFERER_VA = "https://myrx.example.io"
$env:GLASSESON_FLOW_ID_VA = "go-va"

Write-Host "Environment variables set successfully!" -ForegroundColor Green

# Save the original directory
$originalLocation = Get-Location

# Start API server in background
Write-Host "Starting API server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd $originalLocation; npm run dev" -NoNewWindow

# Wait a moment for the API server to start
Start-Sleep -Seconds 2

# Start SLA monitoring in background (if enabled)
if ($EnableSLA) {
    Write-Host "Starting SLA monitoring..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "cd $originalLocation; npm run sla" -NoNewWindow
    
    # Wait a moment for SLA monitoring to start
    Start-Sleep -Seconds 2
} else {
    Write-Host "SLA monitoring disabled" -ForegroundColor Yellow
}

# Start web server in background
Write-Host "Starting web interface..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd $originalLocation\web_server; npm start" -NoNewWindow

# Wait a moment for the web server to start
Start-Sleep -Seconds 2

# Open web interface in browser only if not in container
if (-not $inContainer) {
    try {
        Start-Process "http://localhost:8080"
    } catch {
        Write-Host "Could not open browser automatically. Please navigate to http://localhost:8080 manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "Running in container mode. Web interface available at http://localhost:8080" -ForegroundColor Cyan
}

Write-Host "All servers started successfully!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Keep the script running to prevent the container from exiting
if ($inContainer) {
    Write-Host "Container is running. Use Ctrl+C to stop." -ForegroundColor Cyan
    try {
        # Keep the container running
        while ($true) { Start-Sleep -Seconds 10 }
    } catch {
        # Handle termination gracefully
        Write-Host "Shutting down services..." -ForegroundColor Yellow
        # Add any cleanup code here if needed
    }
} 