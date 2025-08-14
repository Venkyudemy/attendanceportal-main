#!/bin/bash

# Docker Startup Script for Attendance Portal with Daily Reset
echo "========================================"
echo "  Attendance Portal with Daily Reset"
echo "  Docker Deployment"
echo "========================================"
echo

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"
echo

# Build and start the services
echo "🚀 Building and starting services..."
docker-compose up --build -d

echo
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo
echo "🔍 Checking backend health..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

echo "🔍 Checking frontend health..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

echo
echo "🔍 Checking daily reset status..."
if curl -f http://localhost:5000/api/employee/reset-status > /dev/null 2>&1; then
    echo "✅ Daily reset endpoint is accessible"
else
    echo "❌ Daily reset endpoint check failed"
fi

echo
echo "========================================"
echo "  System Status"
echo "========================================"
echo "🌐 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo "🔄 Reset Status: http://localhost:5000/api/employee/reset-status"
echo
echo "🕛 Daily Reset Features:"
echo "✅ Automatic reset at 12:00 AM (UTC)"
echo "✅ Manual reset via admin portal"
echo "✅ Force reset for emergencies"
echo "✅ Real-time status monitoring"
echo
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Check status: docker-compose ps"
echo
echo "🎉 System is ready! The daily reset will run automatically at 12:00 AM UTC"
echo
