@echo off
echo ========================================
echo 🐳 ATTENDANCE PORTAL DOCKER STARTUP
echo ========================================
echo.
echo 💡 Choose how you want to start your application:
echo.

echo 1️⃣ Development Mode (with logs)
echo    ✅ Shows all logs in real-time
echo    ✅ Easy to debug issues
echo    ✅ Press Ctrl+C to stop
echo.

echo 2️⃣ Production Mode (background)
echo    ✅ Runs in background
echo    ✅ No logs displayed
echo    ✅ Use 'docker-compose logs -f' to view logs
echo.

echo 3️⃣ Clean Rebuild (recommended for first time)
echo    ✅ Removes old containers and images
echo    ✅ Rebuilds everything from scratch
echo    ✅ Solves most Docker issues
echo.

echo 4️⃣ Production with Nginx Proxy
echo    ✅ Includes reverse proxy
echo    ✅ Better for production deployment
echo    ✅ SSL ready (uncomment in nginx.conf)
echo.

echo 5️⃣ Test Individual Services
echo    ✅ Test MongoDB only
echo    ✅ Test Backend only
echo    ✅ Test Frontend only
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto :development_mode
if "%choice%"=="2" goto :production_mode
if "%choice%"=="3" goto :clean_rebuild
if "%choice%"=="4" goto :production_nginx
if "%choice%"=="5" goto :test_individual
echo ❌ Invalid choice! Please enter 1-5.
pause
exit /b 1

:development_mode
echo.
echo 🚀 Starting in Development Mode...
echo 💡 All logs will be displayed. Press Ctrl+C to stop.
echo.
docker-compose up
goto :end

:production_mode
echo.
echo 🚀 Starting in Production Mode...
echo 💡 Services will run in background.
echo 💡 Use 'docker-compose logs -f' to view logs.
echo.
docker-compose up -d
echo.
echo ✅ Services started! Check status with:
echo 💡 docker-compose ps
echo 💡 docker-compose logs -f
goto :end

:clean_rebuild
echo.
echo 🧹 Cleaning up old containers and images...
docker-compose down -v --rmi all
echo.
echo 🗑️ Cleaning Docker system...
docker system prune -af
echo.
echo 🚀 Rebuilding and starting everything...
docker-compose up --build -d
echo.
echo ✅ Clean rebuild completed! Check status with:
echo 💡 docker-compose ps
echo 💡 docker-compose logs -f
goto :end

:production_nginx
echo.
echo 🚀 Starting with Nginx Proxy...
echo 💡 This includes the reverse proxy service.
echo.
docker-compose --profile production up -d
echo.
echo ✅ Production setup started! Check status with:
echo 💡 docker-compose ps
echo 💡 docker-compose logs -f
goto :end

:test_individual
echo.
echo 🧪 Testing Individual Services...
echo.
echo 1️⃣ Test MongoDB
echo 2️⃣ Test Backend
echo 3️⃣ Test Frontend
echo.
set /p service_choice="Which service to test (1-3): "

if "%service_choice%"=="1" goto :test_mongo
if "%service_choice%"=="2" goto :test_backend
if "%service_choice%"=="3" goto :test_frontend
echo ❌ Invalid choice!
goto :test_individual

:test_mongo
echo.
echo 🗄️ Testing MongoDB...
docker-compose up mongo -d
echo.
echo ⏳ Waiting for MongoDB to start...
timeout /t 10 /nobreak >nul
echo.
echo 📊 MongoDB Status:
docker-compose ps mongo
echo.
echo 📝 MongoDB Logs:
docker-compose logs mongo
goto :end

:test_backend
echo.
echo 🔌 Testing Backend...
echo 💡 Make sure MongoDB is running first!
docker-compose up backend -d
echo.
echo ⏳ Waiting for Backend to start...
timeout /t 15 /nobreak >nul
echo.
echo 📊 Backend Status:
docker-compose ps backend
echo.
echo 📝 Backend Logs:
docker-compose logs backend
goto :end

:test_frontend
echo.
echo 🌐 Testing Frontend...
echo 💡 Make sure Backend is running first!
docker-compose up frontend -d
echo.
echo ⏳ Waiting for Frontend to start...
timeout /t 10 /nobreak >nul
echo.
echo 📊 Frontend Status:
docker-compose ps frontend
echo.
echo 📝 Frontend Logs:
docker-compose logs frontend
goto :end

:end
echo.
echo ========================================
echo 🎯 NEXT STEPS:
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
echo.
echo 🔑 Login Credentials:
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo.
echo 💡 Useful Commands:
echo    docker-compose ps          - Check service status
echo    docker-compose logs -f     - View logs in real-time
echo    docker-compose down        - Stop all services
echo    docker-compose restart     - Restart all services
echo.
pause
