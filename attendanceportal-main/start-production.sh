#!/bin/bash

# Production Startup Script for Attendance Portal
# Optimized for 1000+ users

set -e

echo "🚀 Starting Attendance Portal in Production Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set production environment
export NODE_ENV=production

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p nginx-proxy/ssl
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources

# Check if environment file exists
if [ ! -f "env.production" ]; then
    echo "⚠️  env.production file not found. Creating default..."
    cp env.production.example env.production 2>/dev/null || echo "Please create env.production file manually"
fi

# Load environment variables
if [ -f "env.production" ]; then
    echo "📋 Loading environment variables..."
    export $(cat env.production | grep -v '^#' | xargs)
fi

# Set default values for critical variables
export MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-secure_password_123}
export JWT_SECRET=${JWT_SECRET:-your_super_secure_jwt_secret_key_here_minimum_32_characters}

echo "🔐 Using MongoDB password: ${MONGO_ROOT_PASSWORD:0:8}..."
echo "🔑 Using JWT secret: ${JWT_SECRET:0:20}..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Clean up old images (optional)
read -p "🧹 Clean up old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up old images..."
    docker system prune -f
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

# Check if all services are running
if docker-compose ps | grep -q "unhealthy\|starting\|restarting"; then
    echo "⚠️  Some services are not healthy. Checking logs..."
    docker-compose logs --tail=50
    echo "❌ Some services failed to start properly."
    exit 1
fi

echo "✅ All services are running and healthy!"

# Show service URLs
echo ""
echo "🌐 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo "   Redis: localhost:6379"
echo "   MongoDB Express: http://localhost:8081"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3001"

# Show monitoring commands
echo ""
echo "📊 Monitoring Commands:"
echo "   View logs: docker-compose logs -f"
echo "   View specific service logs: docker-compose logs -f backend"
echo "   Check service status: docker-compose ps"
echo "   Scale backend: docker-compose up -d --scale backend=3"
echo "   Stop services: docker-compose down"

# Show performance tips
echo ""
echo "🚀 Performance Tips for 1000+ Users:"
echo "   - Monitor memory usage: docker stats"
echo "   - Check database performance: docker-compose exec mongo mongosh --eval 'db.serverStatus()'"
echo "   - Monitor Redis: docker-compose exec redis redis-cli info memory"
echo "   - View Nginx logs: docker-compose logs -f nginx-proxy"

echo ""
echo "🎉 Production deployment completed successfully!"
echo "Your application is now ready to handle 1000+ users!"
