@echo off
echo ========================================
echo 🧪 Testing Docker Compose Login Setup
echo ========================================
echo.

echo 🔍 Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running or not installed!
    echo 💡 Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo 🚀 Starting Docker Compose services...
docker-compose down
docker-compose up -d

echo.
echo ⏳ Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo 🔍 Checking service status...
docker-compose ps

echo.
echo 📊 Checking MongoDB logs for admin creation...
docker-compose logs mongo | findstr "Admin user"

echo.
echo 🔧 Checking Backend logs for admin creation...
docker-compose logs backend | findstr "Admin user"

echo.
echo 🌐 Testing frontend accessibility...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible at http://localhost:3000
) else (
    echo ❌ Frontend is not accessible
)

echo.
echo 🔌 Testing backend API...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is accessible at http://localhost:5000
) else (
    echo ❌ Backend API is not accessible
)

echo.
echo 🗄️ Testing MongoDB connection...
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
)

echo.
echo ========================================
echo 📋 Login Credentials:
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo ========================================
echo.
echo 💡 Open http://localhost:3000 in your browser
echo 💡 Try logging in with the credentials above
echo.
echo 🔍 To see real-time logs: docker-compose logs -f
echo 🛑 To stop services: docker-compose down
echo.
pause
