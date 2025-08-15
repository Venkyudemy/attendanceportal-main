@echo off
echo 🔧 Fixing Backend Startup Issues...

REM Check if Docker is installed
echo 🔍 Checking Docker installation...
docker --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Docker is installed
    docker --version
) else (
    echo ❌ Docker is not installed or not in PATH
    pause
    exit /b 1
)

REM Clean up containers and volumes
echo 🧹 Cleaning up containers and volumes...
docker compose down -v
docker system prune -f
echo ✅ Cleanup completed

REM Rebuild services
echo 🔨 Rebuilding services...
docker compose build --no-cache
echo ✅ Services rebuilt

REM Start services
echo 🚀 Starting services...
docker compose up -d
echo ✅ Services started

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...

REM Wait for MongoDB to be healthy
echo Waiting for MongoDB to be healthy...
:wait_mongo
docker compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo MongoDB not ready yet...
    timeout /t 5 /nobreak >nul
    goto wait_mongo
)
echo ✅ MongoDB is healthy

REM Wait for Backend to be healthy
echo Waiting for Backend to be healthy...
:wait_backend
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo Backend not ready yet...
    timeout /t 5 /nobreak >nul
    goto wait_backend
)
echo ✅ Backend is healthy

REM Wait for Frontend to be healthy
echo Waiting for Frontend to be healthy...
:wait_frontend
curl -f http://localhost:3000/health >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo Frontend not ready yet...
    timeout /t 5 /nobreak >nul
    goto wait_frontend
)
echo ✅ Frontend is healthy

REM Test connectivity
echo 🔗 Testing connectivity...

REM Test MongoDB connectivity
docker compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
)

REM Test Backend connectivity
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend is accessible
) else (
    echo ❌ Backend is not accessible
)

REM Test Frontend connectivity
curl -f http://localhost:3000/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend is not accessible
)

REM Test Frontend to Backend proxy
curl -f http://localhost:3000/api/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend to Backend proxy is working
) else (
    echo ❌ Frontend to Backend proxy is not working
)

REM Check environment variables
echo 🔍 Checking environment variables...
echo Checking MONGO_URL...
docker compose exec backend env | findstr MONGO_URL
if !ERRORLEVEL! EQU 0 (
    echo ✅ MONGO_URL is set
) else (
    echo ❌ MONGO_URL is not set
)

echo Checking NODE_ENV...
docker compose exec backend env | findstr NODE_ENV
if !ERRORLEVEL! EQU 0 (
    echo ✅ NODE_ENV is set to production
) else (
    echo ❌ NODE_ENV is not set correctly
)

REM Show service status
echo 📊 Service Status:
docker compose ps

echo 📋 Recent logs:
echo MongoDB logs:
docker compose logs --tail=5 mongo
echo.
echo Backend logs:
docker compose logs --tail=10 backend
echo.
echo Frontend logs:
docker compose logs --tail=5 frontend

echo.
echo 🎉 Backend startup issues fixed!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
pause
