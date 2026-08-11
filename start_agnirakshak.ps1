# AgniRakshak PowerShell 1-Click Launcher
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "               🔥 AGNIRAKSHAK ENVIRONMENTAL AI NETWORK 🔥" -ForegroundColor Cyan
Write-Host "           Open Innovation Track | Team Hell Fire Club" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""

# Check Prerequisites
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python is not installed or not in PATH!" -ForegroundColor Red
    Exit 1
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH!" -ForegroundColor Red
    Exit 1
}

Write-Host "[1/3] Verifying Backend Dependencies..." -ForegroundColor Green
pip install -r requirements.txt --quiet --no-warn-script-location

Write-Host "[2/3] Verifying Frontend Dependencies..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
}

Write-Host "[3/3] Launching AgniRakshak Network..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --reload --port 8000"
Set-Location -Path "$PSScriptRoot\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "[SUCCESS] AgniRakshak is running on http://localhost:5173" -ForegroundColor Green
