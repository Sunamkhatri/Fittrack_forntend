# Start MongoDB, API, and Next.js frontend for FitTrack
$root = Split-Path $PSScriptRoot -Parent

Write-Host "=== FitTrack — starting all services ===" -ForegroundColor Green

# MongoDB (background)
$mongoJob = Start-Job -ScriptBlock {
  param($scriptPath)
  & powershell -ExecutionPolicy Bypass -File $scriptPath
} -ArgumentList (Join-Path $using:root "scripts\start-mongodb.ps1")

Start-Sleep -Seconds 3
Write-Host "[1/3] MongoDB starting on 127.0.0.1:27017" -ForegroundColor Yellow

# API (new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"
Write-Host "[2/3] API starting on http://localhost:8089" -ForegroundColor Yellow

Start-Sleep -Seconds 2

# Frontend (new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Write-Host "[3/3] Frontend starting on http://localhost:3000" -ForegroundColor Yellow

Write-Host ""
Write-Host "Open http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host "Postman collection: backend/postman/FitTrack-Auth.postman_collection.json" -ForegroundColor Cyan
