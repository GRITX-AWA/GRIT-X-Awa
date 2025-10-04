@echo off
echo Starting NASA Space Apps Challenge Development Servers...
echo.

REM Change to the project root directory
cd /d "%~dp0"

REM Check if virtual environment exists, create if not
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    echo Installing dependencies...
    pip install -r requirements.txt
    cd ..
)

REM Check if node_modules exists in frontend, install if not
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Start backend in a new window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:4325
echo.
echo Press any key to continue...
pause > nul