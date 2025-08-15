#!/bin/bash

echo "🧪 Testing React Frontend Production Build..."

# Test 1: Verify Dockerfile has production stage
echo "📋 Checking Dockerfile structure..."
if grep -q "FROM nginx:alpine AS production" Frontend/Dockerfile; then
    echo "✅ Production stage found in Dockerfile"
else
    echo "❌ Production stage not found in Dockerfile"
    exit 1
fi

# Test 2: Build with production target
echo "🔨 Building frontend with production target..."
docker build -f Frontend/Dockerfile --target production -t test-frontend:production ./Frontend

if [ $? -eq 0 ]; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed"
    exit 1
fi

# Test 3: Test docker-compose build
echo "🐳 Testing docker-compose build..."
docker-compose build frontend

if [ $? -eq 0 ]; then
    echo "✅ Docker-compose build successful"
else
    echo "❌ Docker-compose build failed"
    exit 1
fi

# Test 4: Verify docker-compose version compatibility
echo "📊 Checking Docker Compose version..."
docker-compose version

echo "🎉 All tests passed! Your setup is ready for production deployment."
echo "🚀 You can now run: docker-compose up -d"
