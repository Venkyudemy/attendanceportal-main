@echo off
echo 🚀 Starting Production Deployment of Attendance Portal...

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

REM Remove old containers and images
echo 🗑️ Cleaning up old containers and images...
docker-compose down --rmi all --volumes --remove-orphans

REM Build and start services with production config
echo 🔨 Building and starting production services...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 45 /nobreak >nul

REM Check service status
echo 📊 Checking service status...
docker-compose -f docker-compose.prod.yml ps

echo.
echo 🎉 Production Deployment Complete!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:5000
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@techcorp.com
echo    Password: password123
echo.
echo 📋 Useful Commands:
echo    View logs: docker-compose -f docker-compose.prod.yml logs -f
echo    Stop services: docker-compose -f docker-compose.prod.yml down
echo    Restart services: docker-compose -f docker-compose.prod.yml restart
echo.
echo ⚠️  For external access, make sure to:
echo    1. Configure your firewall to allow ports 80 and 5000
echo    2. Update REACT_APP_API_URL in docker-compose.prod.yml with your server IP
echo    3. Set up a domain name if needed
echo.
pause
