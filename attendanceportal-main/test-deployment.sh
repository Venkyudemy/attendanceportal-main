#!/bin/bash

echo "🧪 Testing Deployment and Connectivity..."

# Test 1: Build and start services
echo "📦 Building and starting services..."
docker-compose down
docker-compose build
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test 2: Check if containers are running
echo "🔍 Checking container status..."
docker-compose ps

# Test 3: Check backend connectivity
echo "🔧 Testing backend connectivity..."
if curl -f http://localhost:5000/api/health; then
    echo "✅ Backend is running and accessible"
else
    echo "❌ Backend is not accessible"
    echo "📋 Backend logs:"
    docker-compose logs backend
fi

# Test 4: Check frontend connectivity
echo "🌐 Testing frontend connectivity..."
if curl -f http://localhost:3000; then
    echo "✅ Frontend is running and accessible"
else
    echo "❌ Frontend is not accessible"
    echo "📋 Frontend logs:"
    docker-compose logs frontend
fi

# Test 5: Check MongoDB connectivity
echo "🗄️ Testing MongoDB connectivity..."
if docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB is not accessible"
    echo "📋 MongoDB logs:"
    docker-compose logs mongo
fi

# Test 6: Test login API
echo "🔐 Testing login API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login API is working"
else
    echo "❌ Login API is not working"
    echo "Response: $LOGIN_RESPONSE"
fi

echo "🎉 Deployment test completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🗄️ MongoDB: localhost:27017"
