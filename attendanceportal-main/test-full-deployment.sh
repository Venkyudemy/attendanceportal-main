#!/bin/bash

echo "🧪 Testing Full Deployment - Frontend, Backend, and MongoDB..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to test service health
test_service_health() {
    local service=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if docker-compose ps $service | grep -q "Up"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        echo "   Logs:"
        docker-compose logs --tail=10 $service
    fi
}

# Build and start services
echo -e "${BLUE}📦 Building and starting services...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

# Test 1: Check if all containers are running
echo ""
echo -e "${BLUE}🔍 Checking container status:${NC}"
test_service_health "mongo" "MongoDB Container"
test_service_health "backend" "Backend Container"
test_service_health "frontend" "Frontend Container"

# Test 2: Check MongoDB connectivity
echo ""
echo -e "${BLUE}🗄️ Testing MongoDB connectivity:${NC}"
if docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is accessible${NC}"
else
    echo -e "${RED}❌ MongoDB is not accessible${NC}"
    docker-compose logs mongo
fi

# Test 3: Check backend connectivity
echo ""
echo -e "${BLUE}🔧 Testing backend connectivity:${NC}"
test_endpoint "http://localhost:5000/" "Backend Root endpoint"
test_endpoint "http://localhost:5000/api/health" "Backend Health check"

# Test 4: Check frontend connectivity
echo ""
echo -e "${BLUE}🌐 Testing frontend connectivity:${NC}"
test_endpoint "http://localhost:3000/" "Frontend Root endpoint"
test_endpoint "http://localhost:3000/health" "Frontend Health check"

# Test 5: Test frontend to backend proxy
echo ""
echo -e "${BLUE}🔗 Testing frontend to backend proxy:${NC}"
test_endpoint "http://localhost:3000/api/health" "Frontend API proxy to backend"

# Test 6: Test login API through frontend proxy
echo ""
echo -e "${BLUE}🔐 Testing login API through frontend proxy:${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token\|error"; then
    echo -e "${GREEN}✅ Login API proxy is working${NC}"
    echo "   Response: $LOGIN_RESPONSE"
else
    echo -e "${RED}❌ Login API proxy is not working${NC}"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test 7: Check network connectivity between containers
echo ""
echo -e "${BLUE}🌐 Testing inter-container connectivity:${NC}"
if docker-compose exec frontend curl -f http://backend:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend can reach backend via Docker network${NC}"
else
    echo -e "${RED}❌ Frontend cannot reach backend via Docker network${NC}"
fi

# Display final status
echo ""
echo -e "${BLUE}📊 Final Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 Full deployment test completed!${NC}"
echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
echo -e "${BLUE}🗄️ MongoDB: localhost:27017${NC}"
echo ""
echo -e "${YELLOW}💡 If you see any failures, check the logs with:${NC}"
echo "   docker-compose logs [service-name]"
