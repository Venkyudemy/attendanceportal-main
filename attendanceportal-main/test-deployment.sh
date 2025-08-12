#!/bin/bash

# Test Deployment Script for Attendance Portal
# This script verifies that all services are running and accessible

echo "🔍 Testing Attendance Portal Deployment..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if Docker is running
echo "1. Checking Docker status..."
if docker info > /dev/null 2>&1; then
    print_status 0 "Docker is running"
else
    print_status 1 "Docker is not running"
    exit 1
fi

# Check if containers are running
echo "2. Checking container status..."
if docker ps | grep -q "attendance-backend"; then
    print_status 0 "Backend container is running"
else
    print_status 1 "Backend container is not running"
fi

if docker ps | grep -q "attendance-frontend"; then
    print_status 0 "Frontend container is running"
else
    print_status 1 "Frontend container is not running"
fi

if docker ps | grep -q "attendance-mongodb"; then
    print_status 0 "MongoDB container is running"
else
    print_status 1 "MongoDB container is not running"
fi

# Check network connectivity
echo "3. Checking network connectivity..."
if docker network ls | grep -q "attendance-network"; then
    print_status 0 "Docker network exists"
else
    print_status 1 "Docker network missing"
fi

# Test backend health
echo "4. Testing backend health..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    print_status 0 "Backend API is accessible on port 5000"
else
    print_status 1 "Backend API is not accessible on port 5000"
fi

# Test frontend health
echo "5. Testing frontend health..."
if curl -s http://localhost/health > /dev/null; then
    print_status 0 "Frontend is accessible on port 80"
else
    print_status 1 "Frontend is not accessible on port 80"
fi

# Test API proxy
echo "6. Testing API proxy..."
if curl -s http://localhost/api/health > /dev/null; then
    print_status 0 "API proxy is working"
else
    print_status 1 "API proxy is not working"
fi

# Test MongoDB connection
echo "7. Testing MongoDB connection..."
if docker exec attendance-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_status 0 "MongoDB is accessible"
else
    print_status 1 "MongoDB is not accessible"
fi

# Check container logs for errors
echo "8. Checking for errors in container logs..."
echo "   Backend logs (last 10 lines):"
docker logs --tail 10 attendance-backend 2>&1 | grep -i error || echo "   No errors found"

echo "   Frontend logs (last 10 lines):"
docker logs --tail 10 attendance-frontend 2>&1 | grep -i error || echo "   No errors found"

# Test external access simulation
echo "9. Testing external access simulation..."
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "   Your external IP: $EXTERNAL_IP"
echo "   If you have port forwarding, test: http://$EXTERNAL_IP"

# Summary
echo ""
echo "=========================================="
echo "🎯 Deployment Test Summary:"
echo ""

# Count successful tests
SUCCESS_COUNT=0
TOTAL_TESTS=9

# Re-run tests to count successes
if docker info > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if docker ps | grep -q "attendance-backend"; then ((SUCCESS_COUNT++)); fi
if docker ps | grep -q "attendance-frontend"; then ((SUCCESS_COUNT++)); fi
if docker ps | grep -q "attendance-mongodb"; then ((SUCCESS_COUNT++)); fi
if docker network ls | grep -q "attendance-network"; then ((SUCCESS_COUNT++)); fi
if curl -s http://localhost:5000/api/health > /dev/null; then ((SUCCESS_COUNT++)); fi
if curl -s http://localhost/health > /dev/null; then ((SUCCESS_COUNT++)); fi
if curl -s http://localhost/api/health > /dev/null; then ((SUCCESS_COUNT++)); fi
if docker exec attendance-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi

echo "   Tests passed: $SUCCESS_COUNT/$TOTAL_TESTS"

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Your deployment is working correctly.${NC}"
    echo ""
    echo "🌐 Your application should now be accessible via:"
    echo "   - Local: http://localhost"
    echo "   - External: http://$EXTERNAL_IP (if port forwarding is configured)"
    echo "   - AWS Load Balancer: Your configured DNS"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    echo ""
    echo "🔧 Troubleshooting tips:"
    echo "   1. Check container logs: docker logs <container-name>"
    echo "   2. Restart services: docker-compose restart"
    echo "   3. Rebuild and restart: docker-compose up --build -d"
fi

echo ""
echo "📚 For more information, see DEPLOYMENT_INSTRUCTIONS.md"
