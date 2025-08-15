#!/bin/bash

# Test script to verify Docker build with production target
echo "🧪 Testing Docker build with production target..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Test 1: Build the frontend image with production target
echo "📦 Building frontend image with production target..."
docker build -f Frontend/Dockerfile --target production -t attendance-frontend:test ./Frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Test 2: Verify the production stage exists
echo "🔍 Verifying production stage..."
docker build -f Frontend/Dockerfile --target production --dry-run ./Frontend 2>&1 | grep -q "production"
if [ $? -eq 0 ]; then
    echo "✅ Production stage found!"
else
    echo "❌ Production stage not found!"
    exit 1
fi

# Test 3: Test docker-compose build
echo "🐳 Testing docker-compose build..."
docker-compose build frontend

if [ $? -eq 0 ]; then
    echo "✅ Docker-compose build successful!"
else
    echo "❌ Docker-compose build failed!"
    exit 1
fi

echo "🎉 All tests passed! Docker build is working correctly."
echo "🚀 Ready for Jenkins pipeline deployment!"
