#!/bin/bash

# Attendance Portal Docker Deployment Script

echo "🚀 Starting Attendance Portal Deployment..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Check health status
echo "🏥 Checking health status..."
docker-compose exec -T frontend curl -f http://localhost/health || echo "Frontend health check failed"
docker-compose exec -T backend curl -f http://localhost:5000/api/health || echo "Backend health check failed"

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend: http://localhost:5000"
echo "📊 MongoDB: localhost:27017"

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20
