@echo off
echo 🧪 Testing Docker build with production target...

REM Test 1: Build the frontend image with production target
echo 📦 Building frontend image with production target...
docker build -f Frontend\Dockerfile --target production -t attendance-frontend:test ./Frontend

if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend build successful!
) else (
    echo ❌ Frontend build failed!
    exit /b 1
)

REM Test 2: Test docker-compose build
echo 🐳 Testing docker-compose build...
docker-compose build frontend

if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker-compose build successful!
) else (
    echo ❌ Docker-compose build failed!
    exit /b 1
)

echo 🎉 All tests passed! Docker build is working correctly.
echo 🚀 Ready for Jenkins pipeline deployment!
pause
