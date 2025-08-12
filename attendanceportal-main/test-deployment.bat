@echo off
REM Test Deployment Script for Attendance Portal (Windows)
REM This script verifies that all services are running and accessible

echo 🔍 Testing Attendance Portal Deployment...
echo ==========================================

REM Check if Docker is running
echo 1. Checking Docker status...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is running
) else (
    echo ❌ Docker is not running
    pause
    exit /b 1
)

REM Check if containers are running
echo 2. Checking container status...
docker ps | findstr "attendance-backend" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend container is running
) else (
    echo ❌ Backend container is not running
)

docker ps | findstr "attendance-frontend" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend container is running
) else (
    echo ❌ Frontend container is not running
)

docker ps | findstr "attendance-mongodb" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB container is running
) else (
    echo ❌ MongoDB container is not running
)

REM Check network connectivity
echo 3. Checking network connectivity...
docker network ls | findstr "attendance-network" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker network exists
) else (
    echo ❌ Docker network missing
)

REM Test backend health
echo 4. Testing backend health...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is accessible on port 5000
) else (
    echo ❌ Backend API is not accessible on port 5000
)

REM Test frontend health
echo 5. Testing frontend health...
curl -s http://localhost/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible on port 80
) else (
    echo ❌ Frontend is not accessible on port 80
)

REM Test API proxy
echo 6. Testing API proxy...
curl -s http://localhost/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API proxy is working
) else (
    echo ❌ API proxy is not working
)

REM Test MongoDB connection
echo 7. Testing MongoDB connection...
docker exec attendance-mongodb mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
)

REM Check container logs for errors
echo 8. Checking for errors in container logs...
echo    Backend logs (last 10 lines):
docker logs --tail 10 attendance-backend 2>&1 | findstr /i "error" >nul 2>&1
if %errorlevel% equ 0 (
    echo    Errors found in backend logs
) else (
    echo    No errors found
)

echo    Frontend logs (last 10 lines):
docker logs --tail 10 attendance-frontend 2>&1 | findstr /i "error" >nul 2>&1
if %errorlevel% equ 0 (
    echo    Errors found in frontend logs
) else (
    echo    No errors found
)

REM Summary
echo.
echo ==========================================
echo 🎯 Deployment Test Summary:
echo.
echo 📚 For more information, see DEPLOYMENT_INSTRUCTIONS.md
echo.
echo 🌐 Your application should now be accessible via:
echo    - Local: http://localhost
echo    - AWS Load Balancer: Your configured DNS
echo.
pause
