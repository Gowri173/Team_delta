@echo off
echo =======================================================
echo         ServeEase Platform Setup ^& Run Script
echo =======================================================

echo.
echo [1/3] Installing Backend Dependencies...
cd backend
call npm install

echo.
echo [2/3] Installing Frontend Dependencies...
cd ../frontend
call npm install

echo.
echo [3/3] Starting Servers...
echo Starting Backend on port 8000 and Frontend on port 5173...

cd ..
start "ServeEase Backend" cmd /k "cd backend && npm run dev"
start "ServeEase Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo   ServeEase is starting!
echo   Frontend: http://localhost:5173
echo   Backend: http://localhost:8000
echo   Keep the terminal windows open to keep servers running.
echo =======================================================
pause
