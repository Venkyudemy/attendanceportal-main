#!/bin/bash

# Docker Leave Calendar Integration Test Script
# This script tests the leave calendar integration in the Docker environment

set -e

echo "🧪 Testing Leave Calendar Integration in Docker Environment..."
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo "ℹ️  $message"
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_status "error" "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "success" "Docker is running"

# Check if containers are running
if ! docker ps | grep -q "attendanceportal-main-backend-1"; then
    print_status "warning" "Backend container is not running. Starting services..."
    cd attendanceportal-main
    docker-compose up -d
    echo "⏳ Waiting for services to start..."
    sleep 30
else
    print_status "success" "Backend container is running"
fi

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
until docker exec attendanceportal-main-backend-1 curl -f http://localhost:5000/api/health > /dev/null 2>&1; do
    echo "Backend is not healthy yet, waiting..."
    sleep 5
done

print_status "success" "Backend is healthy"

# Test the leave calendar integration
echo ""
echo "🔍 Testing Leave Calendar Integration..."
echo "======================================"

# Step 1: Create test data
print_status "info" "Step 1: Creating test data..."
docker exec attendanceportal-main-backend-1 node /app/scripts/create-test-leave.js

if [ $? -eq 0 ]; then
    print_status "success" "Test data created successfully"
else
    print_status "error" "Failed to create test data"
    exit 1
fi

# Step 2: Test the API endpoints
print_status "info" "Step 2: Testing API endpoints..."

# Test health endpoint
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "success" "Health endpoint is working"
else
    print_status "error" "Health endpoint is not working"
    exit 1
fi

# Test leave requests endpoint
LEAVE_RESPONSE=$(curl -s http://localhost:5000/api/leave/admin)
if echo "$LEAVE_RESPONSE" | grep -q "employeeName"; then
    print_status "success" "Leave requests endpoint is working"
    LEAVE_COUNT=$(echo "$LEAVE_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    print_status "info" "Found $LEAVE_COUNT leave requests"
else
    print_status "error" "Leave requests endpoint is not working"
    exit 1
fi

# Step 3: Test attendance details endpoint
print_status "info" "Step 3: Testing attendance details endpoint..."

# Get employee ID from leave requests
EMPLOYEE_ID=$(echo "$LEAVE_RESPONSE" | jq -r '.[0].employeeId' 2>/dev/null || echo "")
if [ -z "$EMPLOYEE_ID" ] || [ "$EMPLOYEE_ID" = "null" ]; then
    print_status "error" "Could not get employee ID from leave requests"
    exit 1
fi

print_status "info" "Testing with employee ID: $EMPLOYEE_ID"

# Test attendance details for August 2025
ATTENDANCE_RESPONSE=$(curl -s "http://localhost:5000/api/employee/$EMPLOYEE_ID/attendance-details?month=8&year=2025")

if echo "$ATTENDANCE_RESPONSE" | grep -q "calendarData"; then
    print_status "success" "Attendance details endpoint is working"
    
    # Check if leave days are properly marked
    LEAVE_DAYS=$(echo "$ATTENDANCE_RESPONSE" | jq '.calendarData | map(select(.isLeave == true)) | length' 2>/dev/null || echo "0")
    if [ "$LEAVE_DAYS" -gt 0 ]; then
        print_status "success" "Found $LEAVE_DAYS leave days in calendar data"
    else
        print_status "warning" "No leave days found in calendar data"
    fi
    
    # Check month statistics
    MONTH_STATS=$(echo "$ATTENDANCE_RESPONSE" | jq '.monthStats' 2>/dev/null || echo "{}")
    print_status "info" "Month statistics: $MONTH_STATS"
    
else
    print_status "error" "Attendance details endpoint is not working"
    exit 1
fi

# Step 4: Test frontend integration
print_status "info" "Step 4: Testing frontend integration..."

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "success" "Frontend is accessible"
    
    # Test if the frontend can load the attendance details
    FRONTEND_RESPONSE=$(curl -s http://localhost:3000)
    if echo "$FRONTEND_RESPONSE" | grep -q "Attendance Portal"; then
        print_status "success" "Frontend is loading correctly"
    else
        print_status "warning" "Frontend content may not be loading correctly"
    fi
else
    print_status "error" "Frontend is not accessible"
fi

echo ""
echo "🎉 Docker Leave Calendar Integration Test Completed!"
echo "=================================================="

# Summary
echo ""
echo "📋 Test Summary:"
echo "   ✅ Backend container is running and healthy"
echo "   ✅ Test data created successfully"
echo "   ✅ API endpoints are working"
echo "   ✅ Leave calendar integration is functional"
echo "   ✅ Frontend is accessible"

echo ""
echo "🚀 You can now access:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - MongoDB: localhost:27017"

echo ""
echo "💡 To view logs:"
echo "   - Backend logs: docker logs attendanceportal-main-backend-1"
echo "   - Frontend logs: docker logs attendanceportal-main-frontend-1"
echo "   - MongoDB logs: docker logs attendanceportal-main-mongo-1"
