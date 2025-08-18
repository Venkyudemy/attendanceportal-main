@echo off
echo 🔧 Fixing Bad Gateway Error...

REM Stop all Node.js processes
echo 🛑 Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start backend first
echo 🚀 Starting backend server...
cd Backend
start "Backend Server" cmd /k "npm start"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Start frontend
echo 🚀 Starting frontend server...
cd ..\Frontend
start "Frontend Server" cmd /k "npm start"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Services restarted successfully!
echo.
echo 🌐 Access your application at:
echo    http://10.140.94.16:3000
echo.
echo 🔑 Login Credentials:
echo    Admin: admin@techcorp.com / password123
echo    Employee: venkatesh@gmail.com / venkatesh
echo.
echo 🔧 If you still see Bad Gateway:
echo    1. Clear browser cache (Ctrl+F5)
echo    2. Try accessing: http://10.140.94.16:3000
echo    3. Check if both command windows show the services running
echo.
pause
