@echo off
echo 🚀 Starting Attendance Portal Deployment...

REM Stop any existing containers
echo 📦 Stopping existing containers...
docker-compose down

REM Remove old images to ensure fresh build
echo 🧹 Cleaning up old images...
docker system prune -f

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak

REM Check service status
echo 📊 Checking service status...
docker-compose ps

echo ✅ Deployment completed!
echo 🌐 Frontend: http://localhost
echo 🔧 Backend: http://localhost:5000
echo 📊 MongoDB: localhost:27017

REM Show logs
echo 📋 Recent logs:
docker-compose logs --tail=20

pause
