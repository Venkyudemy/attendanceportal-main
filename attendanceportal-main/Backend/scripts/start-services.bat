@echo off
echo Starting Attendance Portal Services...
echo.

echo Starting Backend Server...
cd /d "%~dp0Backend"
start "Backend Server" cmd /k "node index.js"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
cd /d "%~dp0Frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
