@echo off
echo ========================================
echo    Attendance Portal System Startup
echo ========================================
echo.

echo 🔍 Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
)

echo ✅ Docker is available

echo.
echo 🚀 Starting MongoDB container...
docker-compose up -d mongodb

echo.
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🔗 Testing database connection...
cd Backend
node scripts/testConnection.js

echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting frontend...
cd ..\Frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo    System Startup Complete!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🗄️  MongoDB:  mongodb://localhost:27017
echo.
echo 👑 Admin Login: admin@techcorp.com / admin123
echo 👤 Employee Login: employee@techcorp.com / employee123
echo.
echo Press any key to exit...
pause >nul
