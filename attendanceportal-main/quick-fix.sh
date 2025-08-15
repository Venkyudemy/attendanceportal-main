#!/bin/bash

echo "🚀 Quick Fix for Backend Health Issues"

# Stop all containers
echo "🛑 Stopping all containers..."
docker compose down

# Remove all containers and volumes
echo "🧹 Cleaning up containers and volumes..."
docker compose down -v
docker system prune -f

# Rebuild all services
echo "🔨 Rebuilding all services..."
docker compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker compose ps

# Show logs for debugging
echo "📋 Recent logs:"
echo "MongoDB logs:"
docker compose logs --tail=10 mongo
echo ""
echo "Backend logs:"
docker compose logs --tail=15 backend
echo ""
echo "Frontend logs:"
docker compose logs --tail=10 frontend

echo ""
echo "🎉 Quick fix completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🗄️ MongoDB: localhost:27017"
