#!/bin/bash

# Test Docker Build Script for Jenkins Pipeline
echo "Testing Docker build for attendance portal..."

# Test frontend build
echo "Testing frontend Docker build..."
cd Frontend
docker build --target production -t attendance-frontend-test .
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test backend build
echo "Testing backend Docker build..."
cd ../Backend
docker build --target production -t attendance-backend-test .
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test docker-compose build
echo "Testing docker-compose build..."
cd ..
docker-compose build
if [ $? -eq 0 ]; then
    echo "✅ Docker-compose build successful"
else
    echo "❌ Docker-compose build failed"
    exit 1
fi

echo "🎉 All Docker builds successful!"
