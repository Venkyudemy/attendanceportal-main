@echo off
echo ========================================
echo    Restart Services Script
echo ========================================
echo.

echo [1/4] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && node index.js"

echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo [4/4] Starting Frontend Server...
start "Frontend Server" cmd /k "cd Frontend && npm start"

echo.
echo ========================================
echo    Services Restarted Successfully!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Test Credentials:
echo Admin: admin@company.com / admin123
echo Employee: venkatesh111@gmail.com / password123
echo.
echo If you still see connection errors:
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Try incognito/private mode
echo 3. Check browser console (F12)
echo.
pause
