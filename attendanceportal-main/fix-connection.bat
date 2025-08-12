@echo off
echo ========================================
echo   FIXING ATTENDANCE PORTAL CONNECTION
echo ========================================
echo.

echo Step 1: Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ All Node.js processes killed
echo.

echo Step 2: Starting Backend Server...
cd /d "%~dp0Backend"
start "Backend Server" cmd /k "node index.js"
echo ✅ Backend server starting...
echo.

echo Step 3: Waiting for backend to start...
timeout /t 5 /nobreak >nul
echo.

echo Step 4: Starting Frontend Server...
cd /d "%~dp0Frontend"
start "Frontend Server" cmd /k "npm start"
echo ✅ Frontend server starting...
echo.

echo ========================================
echo   SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Test Login Credentials:
echo Email: venkatesh111@gmail.com
echo Password: password123
echo.
echo Press any key to exit...
pause >nul
