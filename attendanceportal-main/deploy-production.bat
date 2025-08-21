@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Production Deployment for Attendance Portal
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is running

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans

REM Remove old images to ensure fresh build
echo [INFO] Removing old images...
docker-compose down --rmi all --volumes --remove-orphans

REM Build and start services
echo [INFO] Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if backend is running
echo [INFO] Checking backend service...
docker-compose ps backend | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Backend service is not running
    docker-compose logs backend
    pause
    exit /b 1
)

echo [SUCCESS] Backend service is running

REM Check if frontend is running
echo [INFO] Checking frontend service...
docker-compose ps frontend | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Frontend service is not running
    docker-compose logs frontend
    pause
    exit /b 1
)

echo [SUCCESS] Frontend service is running

REM Check if MongoDB is running
echo [INFO] Checking MongoDB service...
docker-compose ps mongo | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB service is not running
    docker-compose logs mongo
    pause
    exit /b 1
)

echo [SUCCESS] MongoDB service is running

REM Wait for backend to complete initialization
echo [INFO] Waiting for backend initialization to complete...
timeout /t 60 /nobreak >nul

REM Check backend logs for admin user creation
echo [INFO] Checking admin user creation...
docker-compose logs backend | findstr "Admin user verification successful" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Admin user created successfully
) else (
    echo [WARNING] Admin user creation status unclear, checking logs...
    docker-compose logs backend
)

REM Display service status
echo [INFO] Deployment completed! Service status:
docker-compose ps

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
echo    Update deployment: deploy-production.bat
echo.

echo [SUCCESS] Production deployment completed successfully!
pause
