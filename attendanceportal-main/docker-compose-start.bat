@echo off
REM Docker Compose Startup Script for Attendance Portal (Windows)
REM This script ensures proper initialization and admin user creation

echo 🚀 Starting Attendance Portal with Docker Compose...

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build the images
echo 🔨 Building Docker images...
docker-compose build --no-cache

REM Start the services
echo 🚀 Starting services...
docker-compose up -d

REM Wait for MongoDB to be ready
echo ⏳ Waiting for MongoDB to be ready...
timeout /t 20 /nobreak >nul

REM Check if backend is running
echo 🔍 Checking backend status...
docker-compose ps

REM Show logs for debugging
echo 📋 Backend logs:
docker-compose logs backend

echo 📋 MongoDB logs:
docker-compose logs mongo

echo.
echo 🎯 Docker Compose deployment completed!
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Backend: http://localhost:5000
echo 🔗 MongoDB: localhost:27017
echo.
echo 🔑 Admin Login: admin@portal.com / Admin@123
echo 👤 Employee Login: venkatesh@gmail.com / venkatesh
echo.
echo 💡 To view logs: docker-compose logs -f
echo 💡 To stop: docker-compose down

pause
