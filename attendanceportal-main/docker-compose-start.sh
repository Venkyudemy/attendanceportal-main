#!/bin/bash

# Docker Compose Startup Script for Attendance Portal
# This script ensures proper initialization and admin user creation

echo "🚀 Starting Attendance Portal with Docker Compose..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove any existing volumes (optional - uncomment if you want fresh data)
# echo "🗑️  Removing existing volumes..."
# docker-compose down -v

# Build the images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 20

# Check if backend is running
echo "🔍 Checking backend status..."
docker-compose ps

# Show logs for debugging
echo "📋 Backend logs:"
docker-compose logs backend

echo "📋 MongoDB logs:"
docker-compose logs mongo

echo ""
echo "🎯 Docker Compose deployment completed!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:5000"
echo "🔗 MongoDB: localhost:27017"
echo ""
echo "🔑 Admin Login: admin@portal.com / Admin@123"
echo "👤 Employee Login: venkatesh@gmail.com / venkatesh"
echo ""
echo "💡 To view logs: docker-compose logs -f"
echo "💡 To stop: docker-compose down"
