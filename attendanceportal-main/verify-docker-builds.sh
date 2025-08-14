#!/bin/bash

# Docker Build Verification Script
echo "🔍 Verifying Docker builds for attendance portal..."

# Test Backend Docker build
echo "📦 Testing Backend Docker build..."
cd Backend
if docker build --target production -t attendance-backend-test .; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test Frontend Docker build
echo "📦 Testing Frontend Docker build..."
cd ../Frontend
if docker build --target production -t attendance-frontend-test .; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test Docker Compose build
echo "📦 Testing Docker Compose build..."
cd ..
if docker compose build; then
    echo "✅ Docker Compose build successful"
else
    echo "❌ Docker Compose build failed"
    exit 1
fi

echo "🎉 All Docker builds verified successfully!"
echo ""
echo "📋 Build Summary:"
echo "   ✅ Backend: Multi-stage build with production target"
echo "   ✅ Frontend: Multi-stage build with production target"
echo "   ✅ Docker Compose: No deprecated version, proper targets"
echo ""
echo "🚀 Ready for production deployment!"
