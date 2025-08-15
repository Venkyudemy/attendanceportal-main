@echo off
echo 🧪 Testing Backend Dockerfile Build and Health Checks...

REM Clean up any existing test containers
echo 🧹 Cleaning up test containers...
docker stop test-backend test-mongo 2>nul
docker rm test-backend test-mongo 2>nul
docker rmi test-backend 2>nul

REM Test 1: Build
echo 🔨 Testing Backend Dockerfile build...
docker build -t test-backend ./Backend
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend Dockerfile builds successfully
) else (
    echo ❌ Backend Dockerfile build failed
    pause
    exit /b 1
)

REM Test 2: Startup and Health Check
echo 🚀 Testing Backend container startup...

REM Start MongoDB first
docker run -d --name test-mongo -p 27017:27017 mongo:6

REM Wait for MongoDB to be ready
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

REM Start backend container
docker run -d --name test-backend --link test-mongo:mongo -p 5000:5000 test-backend

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 30 /nobreak >nul

REM Test health check
curl -f http://localhost:5000/api/health >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend health check passes
) else (
    echo ❌ Backend health check fails
    echo 📋 Backend container logs:
    docker logs test-backend
    pause
    exit /b 1
)

REM Show container logs
echo 📋 Backend container logs:
docker logs test-backend

echo.
echo 🎉 All tests passed! Backend Dockerfile is working correctly.

REM Clean up
echo 🧹 Cleaning up test containers...
docker stop test-backend test-mongo
docker rm test-backend test-mongo
docker rmi test-backend

pause
