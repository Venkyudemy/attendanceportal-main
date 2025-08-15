#!/bin/bash

echo "🧪 Testing Docker builds with production stages..."

# Test 1: Build frontend with production target
echo "📦 Building frontend with production target..."
docker build -f Frontend/Dockerfile --target production -t test-frontend:prod ./Frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test 2: Build backend with production target
echo "🔧 Building backend with production target..."
docker build -f Backend/Dockerfile --target production -t test-backend:prod ./Backend

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test 3: Test docker-compose build
echo "🐳 Testing docker-compose build..."
docker-compose build

if [ $? -eq 0 ]; then
    echo "✅ Docker-compose build successful"
else
    echo "❌ Docker-compose build failed"
    exit 1
fi

# Test 4: Verify production stages exist
echo "🔍 Verifying production stages..."
if docker build -f Frontend/Dockerfile --target production --dry-run ./Frontend 2>&1 | grep -q "production"; then
    echo "✅ Frontend production stage found"
else
    echo "❌ Frontend production stage not found"
    exit 1
fi

if docker build -f Backend/Dockerfile --target production --dry-run ./Backend 2>&1 | grep -q "production"; then
    echo "✅ Backend production stage found"
else
    echo "❌ Backend production stage not found"
    exit 1
fi

echo "🎉 All tests passed! Docker builds are working correctly."
echo "🚀 Ready for Jenkins pipeline deployment!"
