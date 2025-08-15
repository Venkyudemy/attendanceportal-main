@echo off
echo 🧪 Testing Deployment and Connectivity...

REM Test 1: Build and start services
echo 📦 Building and starting services...
docker-compose down
docker-compose build
docker-compose up -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Test 2: Check if containers are running
echo 🔍 Checking container status...
docker-compose ps

REM Test 3: Check backend connectivity
echo 🔧 Testing backend connectivity...
curl -f http://localhost:5000/api/health
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is running and accessible
) else (
    echo ❌ Backend is not accessible
    echo 📋 Backend logs:
    docker-compose logs backend
)

REM Test 4: Check frontend connectivity
echo 🌐 Testing frontend connectivity...
curl -f http://localhost:3000
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend is running and accessible
) else (
    echo ❌ Frontend is not accessible
    echo 📋 Frontend logs:
    docker-compose logs frontend
)

echo 🎉 Deployment test completed!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
pause
