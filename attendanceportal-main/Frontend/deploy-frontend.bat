@echo off
REM Frontend Deployment Script for Windows
REM Usage: deploy-frontend.bat <BACKEND_PRIVATE_IP>

if "%~1"=="" (
    echo Usage: %0 ^<BACKEND_PRIVATE_IP^>
    echo Example: %0 10.0.1.20
    exit /b 1
)

set BACKEND_PRIVATE_IP=%~1

echo 🚀 Deploying Frontend with Backend IP: %BACKEND_PRIVATE_IP%

REM Create nginx.conf with the backend IP
echo 📝 Creating Nginx configuration...
powershell -Command "(Get-Content nginx.conf.template) -replace 'BACKEND_PRIVATE_IP', '%BACKEND_PRIVATE_IP%' | Set-Content nginx.conf"

echo ✅ Nginx configuration created with backend IP: %BACKEND_PRIVATE_IP%

REM Update docker-compose.yml with the backend IP
echo 📝 Updating Docker Compose configuration...
powershell -Command "(Get-Content docker-compose.frontend.yml) -replace '<BACKEND_PRIVATE_IP>', '%BACKEND_PRIVATE_IP%' | Set-Content docker-compose.frontend.yml"

echo ✅ Docker Compose updated with backend IP: %BACKEND_PRIVATE_IP%

REM Copy the frontend compose file to the main docker-compose.yml
copy docker-compose.frontend.yml docker-compose.yml

echo 🚀 Starting Frontend container...
docker-compose up -d

echo ✅ Frontend deployment completed!
echo 🌐 Frontend should be available at: http://localhost:3000
echo 🔗 Backend API endpoint: http://%BACKEND_PRIVATE_IP%:5000/api

REM Show container status
echo 📊 Container status:
docker-compose ps

REM Show logs
echo 📋 Recent logs:
docker-compose logs --tail=10

pause
