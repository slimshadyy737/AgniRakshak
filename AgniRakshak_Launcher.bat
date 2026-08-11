@echo off
TITLE AgniRakshak - 1-Click Automated Launcher
COLOR 0A
CLS

echo ===============================================================================
echo                🔥 AGNIRAKSHAK ENVIRONMENTAL AI NETWORK 🔥
echo            Open Innovation Track | Team Hell Fire Club
echo ===============================================================================
echo.
echo [1/4] Checking System Prerequisites...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.10+.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js 18+.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected.
echo.
echo [2/4] Verifying & Installing Backend Dependencies...
if exist "requirements.txt" (
    python -m pip install -r requirements.txt --quiet --no-warn-script-location
) else (
    python -m pip install fastapi uvicorn pydantic scikit-learn numpy scipy requests --quiet --no-warn-script-location
)
echo [OK] Backend dependencies ready.

echo.
echo [3/4] Verifying & Installing Frontend Dependencies...
cd frontend
if not exist "node_modules\" (
    echo Installing npm packages in frontend (first run)...
    call npm install
) else (
    echo [OK] Frontend packages already installed.
)

echo.
echo [4/4] Launching AgniRakshak Servers & Dashboard...
echo Starting FastAPI Python Backend Server on http://localhost:8000 ...
start "AgniRakshak Backend API (Port 8000)" cmd /k "cd .. && python -m uvicorn backend.main:app --reload --port 8000"

echo Starting Vite React Frontend Dashboard on http://localhost:5173 ...
start "AgniRakshak Frontend UI (Port 5173)" cmd /k "npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo ===============================================================================
echo [SUCCESS] AgniRakshak is now live!
echo • Frontend Web App:  http://localhost:5173
echo • Backend API Docs:  http://localhost:8000/docs
echo • Printable Dispatch Sheet: http://localhost:8000/api/incidents/export-html
echo ===============================================================================
pause
