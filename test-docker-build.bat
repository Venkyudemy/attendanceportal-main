@echo off
REM Test Docker Build Script for Jenkins Pipeline (Windows)
echo Testing Docker build for attendance portal...

REM Test frontend build
echo Testing frontend Docker build...
cd Frontend
docker build --target production -t attendance-frontend-test .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
echo ✅ Frontend build successful

REM Test backend build
echo Testing backend Docker build...
cd ..\Backend
docker build --target production -t attendance-backend-test .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend build failed
    exit /b 1
)
echo ✅ Backend build successful

REM Test docker-compose build
echo Testing docker-compose build...
cd ..
docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker-compose build failed
    exit /b 1
)
echo ✅ Docker-compose build successful

echo 🎉 All Docker builds successful!
