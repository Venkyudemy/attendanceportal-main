@echo off
echo ========================================
echo   Attendance Portal with Daily Reset
echo   Docker Deployment (Windows)
echo ========================================
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Check if Docker Compose is available
docker-compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available. Please install Docker Compose.
    pause
    exit /b 1
)

echo ✅ Docker Compose is available
echo.

echo 🚀 Building and starting services...
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo 📊 Checking service status...
docker-compose ps

echo.
echo 🔍 Checking backend health...
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ❌ Backend health check failed
)

echo 🔍 Checking frontend health...
curl -f http://localhost:80 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend health check failed
)

echo.
echo 🔍 Checking daily reset status...
curl -f http://localhost:5000/api/employee/reset-status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Daily reset endpoint is accessible
) else (
    echo ❌ Daily reset endpoint check failed
)

echo.
echo ========================================
echo   System Status
echo ========================================
echo 🌐 Frontend: http://localhost:80
echo 🔧 Backend API: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
echo 🔄 Reset Status: http://localhost:5000/api/employee/reset-status
echo.
echo 🕛 Daily Reset Features:
echo ✅ Automatic reset at 12:00 AM (UTC)
echo ✅ Manual reset via admin portal
echo ✅ Force reset for emergencies
echo ✅ Real-time status monitoring
echo.
echo 📋 Useful Commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo   Check status: docker-compose ps
echo.
echo 🎉 System is ready! The daily reset will run automatically at 12:00 AM UTC
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:80

echo.
echo System deployed successfully!
echo Check the console output above for any errors.
echo.
pause
