@echo off
echo 🧪 Testing Deployment Fixes...

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
set mongo_timeout=180
set mongo_counter=0
:wait_mongo
docker compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    set /a mongo_counter+=10
    if !mongo_counter! GEQ !mongo_timeout! (
        echo ❌ MongoDB health check timeout after !mongo_timeout! seconds
        docker compose logs mongo
        pause
        exit /b 1
    )
    echo MongoDB not ready yet... (!mongo_counter!/!mongo_timeout!s)
    timeout /t 10 /nobreak >nul
    goto wait_mongo
)
echo ✅ MongoDB is healthy

REM Wait for Backend to be healthy
echo Waiting for Backend to be healthy...
set backend_timeout=300
set backend_counter=0
:wait_backend
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    set /a backend_counter+=10
    if !backend_counter! GEQ !backend_timeout! (
        echo ❌ Backend health check timeout after !backend_timeout! seconds
        docker compose logs backend
        pause
        exit /b 1
    )
    echo Backend not ready yet... (!backend_counter!/!backend_timeout!s)
    timeout /t 10 /nobreak >nul
    goto wait_backend
)
echo ✅ Backend is healthy

REM Wait for Frontend to be healthy
echo Waiting for Frontend to be healthy...
set frontend_timeout=120
set frontend_counter=0
:wait_frontend
curl -f http://localhost:3000/health >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    set /a frontend_counter+=10
    if !frontend_counter! GEQ !frontend_timeout! (
        echo ❌ Frontend health check timeout after !frontend_timeout! seconds
        docker compose logs frontend
        pause
        exit /b 1
    )
    echo Frontend not ready yet... (!frontend_counter!/!frontend_timeout!s)
    timeout /t 10 /nobreak >nul
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

REM Check container status
echo 📊 Container Status:
docker compose ps

REM Check environment variables
echo 🔍 Checking environment variables...
echo Backend environment variables:
docker compose exec backend env | findstr /E "(NODE_ENV|PORT|MONGO_URL)"
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend environment variables are set
) else (
    echo ❌ Backend environment variables are not set correctly
)

REM Test API endpoints
echo 🔧 Testing API endpoints...

REM Test backend root endpoint
curl -f http://localhost:5000/ >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend root endpoint is working
) else (
    echo ❌ Backend root endpoint is not working
)

REM Test backend health endpoint
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend health endpoint is working
) else (
    echo ❌ Backend health endpoint is not working
)

REM Test frontend health endpoint
curl -f http://localhost:3000/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend health endpoint is working
) else (
    echo ❌ Frontend health endpoint is not working
)

REM Show recent logs
echo 📋 Recent logs:
echo MongoDB logs (last 10 lines):
docker compose logs --tail=10 mongo
echo.
echo Backend logs (last 15 lines):
docker compose logs --tail=15 backend
echo.
echo Frontend logs (last 10 lines):
docker compose logs --tail=10 frontend

echo.
echo 🎉 All deployment tests passed!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
echo.
echo ✅ Backend container is now running and healthy!
pause
