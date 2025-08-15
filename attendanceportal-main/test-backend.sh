#!/bin/bash

echo "🧪 Testing Backend Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url")
    status_code=${response: -3}
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        if [ -s /tmp/response.json ]; then
            echo "   Response: $(cat /tmp/response.json)"
        fi
    else
        echo -e "${RED}❌ FAIL (Status: $status_code)${NC}"
        if [ -s /tmp/response.json ]; then
            echo "   Error: $(cat /tmp/response.json)"
        fi
    fi
}

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    echo "Attempt $i/30..."
    sleep 2
done

# Test basic endpoints
echo ""
echo "🔍 Testing Basic Endpoints:"
test_endpoint "http://localhost:5000/" "Root endpoint"
test_endpoint "http://localhost:5000/api/health" "Health check"

# Test authentication endpoints
echo ""
echo "🔐 Testing Authentication Endpoints:"
test_endpoint "http://localhost:5000/api/auth/login" "Login endpoint (POST)" "404"

# Test employee endpoints
echo ""
echo "👥 Testing Employee Endpoints:"
test_endpoint "http://localhost:5000/api/employee" "Employee list"
test_endpoint "http://localhost:5000/api/employee/stats" "Employee stats"

# Test settings endpoints
echo ""
echo "⚙️ Testing Settings Endpoints:"
test_endpoint "http://localhost:5000/api/settings" "Settings endpoint"

# Test leave endpoints
echo ""
echo "📅 Testing Leave Endpoints:"
test_endpoint "http://localhost:5000/api/leave-requests" "Leave requests"

echo ""
echo "🎉 Backend testing completed!"
echo "🌐 Backend URL: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
