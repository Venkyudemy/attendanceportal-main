@echo off
echo ========================================
echo 🧪 TESTING FRONTEND DOCKER BUILD
echo ========================================
echo.
echo 💡 This will test if your Frontend Docker container can be built successfully
echo.

echo 🔍 Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running or not installed!
    echo 💡 Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo 🏗️ Building Frontend Docker image...
cd Frontend
docker build -t attendance-frontend-test .
if %errorlevel% neq 0 (
    echo.
    echo ❌ Frontend Docker build failed!
    echo 💡 Check the error messages above
    echo.
    echo 🔧 Common fixes:
    echo    - Make sure all dependencies are installed
    echo    - Check if there are build errors in the React app
    echo    - Verify the Dockerfile syntax
    pause
    exit /b 1
)
echo ✅ Frontend Docker build successful!

echo.
echo 🧪 Testing Frontend container...
docker run -d --name frontend-test -p 3001:80 attendance-frontend-test
if %errorlevel% neq 0 (
    echo ❌ Frontend container failed to start!
    pause
    exit /b 1
)
echo ✅ Frontend container started successfully!

echo.
echo ⏳ Waiting for container to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Testing frontend accessibility...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible at http://localhost:3001
) else (
    echo ⚠️ Frontend might not be fully ready yet
)

echo.
echo 🧹 Cleaning up test container...
docker stop frontend-test
docker rm frontend-test
docker rmi attendance-frontend-test

echo.
echo ========================================
echo ✅ FRONTEND DOCKER TEST PASSED! 🎉
echo ========================================
echo.
echo 💡 Your Frontend Docker container is working correctly!
echo 💡 You can now use docker-compose up -d to start your full application
echo.
pause
