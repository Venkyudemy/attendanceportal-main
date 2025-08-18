@echo off
echo 🚀 Starting Attendance Portal Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo ✅ Docker environment check passed

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Ask about removing old images
set /p remove_images="Do you want to remove old images? (y/n): "
if /i "%remove_images%"=="y" (
    echo 🗑️ Removing old images...
    docker-compose down --rmi all
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose ps

REM Show logs
echo 📋 Recent logs:
docker-compose logs --tail=20

echo.
echo 🎉 Deployment completed!
echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 🔑 Default Admin Login:
echo    Email: admin@techcorp.com
echo    Password: [Contact system administrator for credentials]
echo.
echo 📊 Working Hours:
echo    Check-in: 9:00 AM
echo    Check-out: 5:45 PM
echo    Late threshold: 9:15 AM
echo.
echo 🔍 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
pause
