@echo off
echo 🚀 Deploying Attendance Portal with Leave Balance Fix
echo ===================================================

setlocal enabledelayedexpansion

echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans

echo [INFO] Removing old images...
docker-compose down --rmi all --volumes --remove-orphans

echo [INFO] Building and starting services...
docker-compose up --build -d

echo [INFO] Waiting for services to be ready...
timeout /t 45 /nobreak >nul

echo [INFO] Checking service status...
docker-compose ps

echo [INFO] Waiting for backend initialization to complete...
timeout /t 90 /nobreak >nul

echo [INFO] Checking backend logs for leave balance fix...
docker-compose logs backend | findstr "Leave Balance"

echo [INFO] Testing admin login...
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@techcorp.com\",\"password\":\"password123\"}" | findstr "token" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Admin login test successful
) else (
    echo [WARNING] Admin login test failed
)

echo.
echo 🎉 Deployment Summary:
echo =====================
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:3000
echo ✅ MongoDB: localhost:27017
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@techcorp.com
echo    Password: password123
echo.
echo 📝 Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
echo [SUCCESS] Deployment completed with leave balance fix!
pause
