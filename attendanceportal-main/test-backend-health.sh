#!/bin/bash

echo "🧪 Testing Backend Health and Connectivity..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test service health
test_service_health() {
    local service=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if docker compose ps $service | grep -q "Up"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        return 1
    fi
}

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
        return 0
    else
        echo -e "${RED}❌ FAIL (Status: $status_code)${NC}"
        if [ -s /tmp/response.json ]; then
            echo "   Error: $(cat /tmp/response.json)"
        fi
        return 1
    fi
}

# Function to check environment variables
check_env_vars() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"
    
    # Check if backend container has MONGO_URL
    if docker compose exec backend env | grep -q "MONGO_URL"; then
        echo -e "${GREEN}✅ MONGO_URL is set${NC}"
        docker compose exec backend env | grep MONGO_URL
    else
        echo -e "${RED}❌ MONGO_URL is not set${NC}"
    fi
    
    # Check if backend container has NODE_ENV
    if docker compose exec backend env | grep -q "NODE_ENV=production"; then
        echo -e "${GREEN}✅ NODE_ENV is set to production${NC}"
    else
        echo -e "${RED}❌ NODE_ENV is not set correctly${NC}"
    fi
}

# Main test flow
main() {
    echo -e "${YELLOW}🧪 Backend Health and Connectivity Test Suite${NC}"
    echo "=================================================="
    
    # Wait for services to be ready
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 30
    
    # Test 1: Check if all containers are running
    echo ""
    echo -e "${BLUE}🔍 Checking container status:${NC}"
    test_service_health "mongo" "MongoDB Container"
    test_service_health "backend" "Backend Container"
    test_service_health "frontend" "Frontend Container"
    
    # Test 2: Check environment variables
    echo ""
    check_env_vars
    
    # Test 3: Check MongoDB connectivity
    echo ""
    echo -e "${BLUE}🗄️ Testing MongoDB connectivity:${NC}"
    if docker compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is accessible${NC}"
    else
        echo -e "${RED}❌ MongoDB is not accessible${NC}"
        echo "📋 MongoDB logs:"
        docker compose logs --tail=10 mongo
    fi
    
    # Test 4: Check backend connectivity
    echo ""
    echo -e "${BLUE}🔧 Testing backend connectivity:${NC}"
    test_endpoint "http://localhost:5000/" "Backend Root endpoint"
    test_endpoint "http://localhost:5000/api/health" "Backend Health check"
    
    # Test 5: Check frontend to backend proxy
    echo ""
    echo -e "${BLUE}🔗 Testing frontend to backend proxy:${NC}"
    test_endpoint "http://localhost:3000/api/health" "Frontend API proxy to backend"
    
    # Test 6: Check backend logs for errors
    echo ""
    echo -e "${BLUE}📋 Checking backend logs for errors:${NC}"
    if docker compose logs backend | grep -i "error\|failed\|exception" > /dev/null; then
        echo -e "${RED}❌ Errors found in backend logs:${NC}"
        docker compose logs backend | grep -i "error\|failed\|exception"
    else
        echo -e "${GREEN}✅ No errors found in backend logs${NC}"
    fi
    
    # Test 7: Check MongoDB connection in backend logs
    echo ""
    echo -e "${BLUE}🔍 Checking MongoDB connection in backend logs:${NC}"
    if docker compose logs backend | grep -i "connected to mongodb" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB connection successful${NC}"
    else
        echo -e "${RED}❌ MongoDB connection not found in logs${NC}"
        echo "📋 Recent backend logs:"
        docker compose logs --tail=20 backend
    fi
    
    # Display final status
    echo ""
    echo -e "${BLUE}📊 Final Status:${NC}"
    docker compose ps
    
    echo ""
    echo -e "${GREEN}🎉 Backend health test completed!${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
    echo -e "${BLUE}🗄️ MongoDB: localhost:27017${NC}"
}

# Run main function
main
