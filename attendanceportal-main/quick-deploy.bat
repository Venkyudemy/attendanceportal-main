@echo off
echo 🔄 Quick Deployment - Updating with correct server IP...

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Deploy with updated configuration
echo 🚀 Deploying with updated server IP (10.140.94.16)...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check status
echo 📊 Checking service status...
docker-compose -f docker-compose.prod.yml ps

echo.
echo ✅ Quick deployment complete!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://10.140.94.16
echo    Backend API: http://10.140.94.16:5000
echo.
echo 🔑 Admin Login Credentials:
echo    Email: admin@techcorp.com
echo    Password: password123
echo.
echo 🔧 If you still see connection errors:
echo    1. Clear your browser cache (Ctrl+F5)
echo    2. Try accessing: http://10.140.94.16
echo    3. Check if both services are running above
echo.
pause
