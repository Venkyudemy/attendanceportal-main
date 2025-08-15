@echo off
echo 🔧 Troubleshooting Attendance Portal Deployment...

REM Check if Docker is installed
echo 🔍 Checking Docker installation...
docker --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Docker is installed
    docker --version
) else (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop or Docker Engine
    pause
    exit /b 1
)

REM Check if Docker Compose is available
echo 🔍 Checking Docker Compose...
docker compose version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Docker Compose is available
    docker compose version
) else (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Compose is installed
    pause
    exit /b 1
)

echo.
echo Choose an option:
echo 1) Clean up and rebuild everything
echo 2) Check current service status
echo 3) Test connectivity
echo 4) Show detailed logs
echo 5) Exit

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto :cleanup_rebuild
if "%choice%"=="2" goto :check_status
if "%choice%"=="3" goto :test_connectivity
if "%choice%"=="4" goto :show_logs
if "%choice%"=="5" goto :exit
goto :invalid_choice

:cleanup_rebuild
echo 🧹 Cleaning up containers and volumes...
docker compose down -v
docker system prune -f
echo ✅ Cleanup completed

echo 🔨 Rebuilding services...
docker compose build --no-cache
echo ✅ Services rebuilt

echo 🚀 Starting services...
docker compose up -d
echo ✅ Services started

goto :check_status

:check_status
echo 📊 Checking service status...
docker compose ps

echo 📋 Service logs summary:
echo MongoDB logs:
docker compose logs --tail=5 mongo
echo.
echo Backend logs:
docker compose logs --tail=10 backend
echo.
echo Frontend logs:
docker compose logs --tail=5 frontend
goto :end

:test_connectivity
echo 🔗 Testing connectivity...
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo Testing MongoDB...
docker compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
)

echo Testing Backend...
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend is accessible
) else (
    echo ❌ Backend is not accessible
)

echo Testing Frontend...
curl -f http://localhost:3000/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
)
goto :end

:show_logs
echo 📋 Detailed logs:
echo Press Ctrl+C to stop viewing logs
docker compose logs -f
goto :end

:invalid_choice
echo Invalid choice. Exiting...
goto :exit

:end
echo.
echo 🎉 Troubleshooting completed!
pause

:exit
echo Exiting...
