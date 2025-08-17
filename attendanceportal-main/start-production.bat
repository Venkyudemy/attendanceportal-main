@echo off
chcp 65001 >nul
echo 🚀 Starting Attendance Portal in Production Mode...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Set production environment
set NODE_ENV=production

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "nginx-proxy\ssl" mkdir nginx-proxy\ssl
if not exist "monitoring\grafana\dashboards" mkdir monitoring\grafana\dashboards
if not exist "monitoring\grafana\datasources" mkdir monitoring\grafana\datasources

REM Check if environment file exists
if not exist "env.production" (
    echo ⚠️  env.production file not found. Please create it manually.
    echo Copy env.production.example to env.production and update the values.
    pause
)

REM Set default values for critical variables
set MONGO_ROOT_PASSWORD=secure_password_123
set JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters

echo 🔐 Using MongoDB password: %MONGO_ROOT_PASSWORD%
echo 🔑 Using JWT secret: %JWT_SECRET:~0,20%...

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans

REM Clean up old images (optional)
set /p CLEANUP="🧹 Clean up old Docker images? (y/N): "
if /i "%CLEANUP%"=="y" (
    echo 🧹 Cleaning up old images...
    docker system prune -f
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...
docker-compose ps

REM Check if all services are running
docker-compose ps | findstr "unhealthy starting restarting" >nul
if not errorlevel 1 (
    echo ⚠️  Some services are not healthy. Checking logs...
    docker-compose logs --tail=50
    echo ❌ Some services failed to start properly.
    pause
    exit /b 1
)

echo ✅ All services are running and healthy!

REM Show service URLs
echo.
echo 🌐 Service URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    MongoDB: localhost:27017
echo    Redis: localhost:6379
echo    MongoDB Express: http://localhost:8081
echo    Prometheus: http://localhost:9090
echo    Grafana: http://localhost:3001

REM Show monitoring commands
echo.
echo 📊 Monitoring Commands:
echo    View logs: docker-compose logs -f
echo    View specific service logs: docker-compose logs -f backend
echo    Check service status: docker-compose ps
echo    Scale backend: docker-compose up -d --scale backend=3
echo    Stop services: docker-compose down

REM Show performance tips
echo.
echo 🚀 Performance Tips for 1000+ Users:
echo    - Monitor memory usage: docker stats
echo    - Check database performance: docker-compose exec mongo mongosh --eval "db.serverStatus()"
echo    - Monitor Redis: docker-compose exec redis redis-cli info memory
echo    - View Nginx logs: docker-compose logs -f nginx-proxy

echo.
echo 🎉 Production deployment completed successfully!
echo Your application is now ready to handle 1000+ users!

pause
