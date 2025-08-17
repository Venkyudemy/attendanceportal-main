#!/bin/bash

# Simple Docker Test Script for Leave Calendar Integration
echo "🧪 Testing Docker Setup for Leave Calendar Integration..."
echo "======================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start services
echo "🚀 Building and starting services..."
cd attendanceportal-main
docker-compose down
docker-compose up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test backend
echo "🧪 Testing backend..."
sleep 10
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is working"
else
    echo "❌ Backend is not responding"
    echo "📋 Backend logs:"
    docker-compose logs backend
    exit 1
fi

# Test frontend
echo "🧪 Testing frontend..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is working"
else
    echo "❌ Frontend is not responding"
    echo "📋 Frontend logs:"
    docker-compose logs frontend
    exit 1
fi

# Create test data
echo "📝 Creating test data..."
docker exec attendanceportal-main-backend-1 node /app/scripts/create-test-leave.js

if [ $? -eq 0 ]; then
    echo "✅ Test data created successfully"
else
    echo "❌ Failed to create test data"
    exit 1
fi

# Test leave calendar integration
echo "🔍 Testing leave calendar integration..."
LEAVE_RESPONSE=$(curl -s http://localhost:5000/api/leave/admin)
if echo "$LEAVE_RESPONSE" | grep -q "employeeName"; then
    echo "✅ Leave requests endpoint is working"
    
    # Get employee ID and test attendance details
    EMPLOYEE_ID=$(echo "$LEAVE_RESPONSE" | jq -r '.[0].employeeId' 2>/dev/null || echo "")
    if [ -n "$EMPLOYEE_ID" ] && [ "$EMPLOYEE_ID" != "null" ]; then
        echo "ℹ️  Testing with employee ID: $EMPLOYEE_ID"
        
        ATTENDANCE_RESPONSE=$(curl -s "http://localhost:5000/api/employee/$EMPLOYEE_ID/attendance-details?month=8&year=2025")
        if echo "$ATTENDANCE_RESPONSE" | grep -q "calendarData"; then
            echo "✅ Attendance details endpoint is working"
            
            # Check for leave days
            LEAVE_DAYS=$(echo "$ATTENDANCE_RESPONSE" | jq '.calendarData | map(select(.isLeave == true)) | length' 2>/dev/null || echo "0")
            if [ "$LEAVE_DAYS" -gt 0 ]; then
                echo "✅ Found $LEAVE_DAYS leave days in calendar data"
                echo "🎉 Leave calendar integration is working correctly!"
            else
                echo "⚠️  No leave days found in calendar data"
            fi
        else
            echo "❌ Attendance details endpoint is not working"
        fi
    else
        echo "⚠️  Could not get employee ID from leave requests"
    fi
else
    echo "❌ Leave requests endpoint is not working"
fi

echo ""
echo "🎯 Test Summary:"
echo "   ✅ Docker services are running"
echo "   ✅ Backend API is responding"
echo "   ✅ Frontend is accessible"
echo "   ✅ Test data created"
echo "   ✅ Leave calendar integration tested"
echo ""
echo "🚀 You can now access:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - MongoDB: localhost:27017"
echo ""
echo "💡 To view logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🧹 To stop services:"
echo "   docker-compose down"
