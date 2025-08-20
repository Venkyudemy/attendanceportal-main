#!/bin/bash

echo "========================================"
echo "   AWS Deployment with Database Fix"
echo "========================================"
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🐳 Building and deploying Docker containers..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building containers..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo
echo "🔧 Running database fix script..."
echo "📋 This will fix duplicate records and late status issues..."

# Run the database fix script
docker exec -it attendanceportal-main-backend-1 node fix-database-after-deployment.js

echo
echo "🎉 Deployment completed successfully!"
echo "📊 Your application should now be running without duplicate records or late status issues."
echo
echo "🔗 Access your application at: http://your-aws-instance-ip:3000"
echo "📊 Admin login: admin@techcorp.com / password123"
echo
echo "📝 If you need to run the database fix again manually:"
echo "   docker exec -it attendanceportal-main-backend-1 node fix-database-after-deployment.js"
