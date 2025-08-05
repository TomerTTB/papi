# Save the original directory
$originalLocation = Get-Location

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "Dependencies already installed, skipping npm install..." -ForegroundColor Green
}

# Check if port 3003 is in use
$apiPortInUse = Get-NetTCPConnection -State Listen -LocalPort 3003 -ErrorAction SilentlyContinue
if ($apiPortInUse) {
    Write-Host "Port 3003 is already in use. Attempting to free it..." -ForegroundColor Yellow
    try {
        $processId = $apiPortInUse.OwningProcess
        Stop-Process -Id $processId -Force
        Write-Host "Successfully freed port 3003" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "Failed to free port 3003. Please ensure no other application is using it." -ForegroundColor Red
        exit 1
    }
}

# Check if port 3004 is in use
$webPortInUse = Get-NetTCPConnection -State Listen -LocalPort 3004 -ErrorAction SilentlyContinue
if ($webPortInUse) {
    Write-Host "Port 3004 is already in use. Attempting to free it..." -ForegroundColor Yellow
    try {
        $processId = $webPortInUse.OwningProcess
        Stop-Process -Id $processId -Force
        Write-Host "Successfully freed port 3004" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "Failed to free port 3004. Please ensure no other application is using it." -ForegroundColor Red
        exit 1
    }
}

# Start mock API server in background
Write-Host "Starting mock API server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd $originalLocation; node src/server.js" -NoNewWindow

# Wait a moment for the API server to start
Start-Sleep -Seconds 2

# Start web interface server in background
Write-Host "Starting web interface..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd $originalLocation; node src/web-server.js" -NoNewWindow

# Wait a moment for the web server to start
Start-Sleep -Seconds 2

# Open web interface in browser
try {
    Start-Process "http://localhost:3004"
} catch {
    Write-Host "Could not open browser automatically. Please navigate to http://localhost:3004 manually." -ForegroundColor Yellow
}

Write-Host "All servers started successfully!" -ForegroundColor Green
Write-Host "Mock API server running on http://localhost:3003" -ForegroundColor Cyan
Write-Host "Web interface running on http://localhost:3004" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) { Start-Sleep -Seconds 10 }
} catch {
    Write-Host "Shutting down services..." -ForegroundColor Yellow
} 