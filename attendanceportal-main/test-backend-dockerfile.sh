#!/bin/bash

echo "🧪 Testing Backend Dockerfile Build and Health Checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test backend build
test_backend_build() {
    echo -e "${BLUE}🔨 Testing Backend Dockerfile build...${NC}"
    
    # Build the backend image
    if docker build -t test-backend ./Backend; then
        echo -e "${GREEN}✅ Backend Dockerfile builds successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend Dockerfile build failed${NC}"
        return 1
    fi
}

# Function to test backend container startup
test_backend_startup() {
    echo -e "${BLUE}🚀 Testing Backend container startup...${NC}"
    
    # Start MongoDB first
    docker run -d --name test-mongo -p 27017:27017 mongo:6
    
    # Wait for MongoDB to be ready
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
    
    # Start backend container
    docker run -d --name test-backend --link test-mongo:mongo -p 5000:5000 test-backend
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 30
    
    # Test health check
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passes${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend health check fails${NC}"
        return 1
    fi
}

# Function to clean up test containers
cleanup_test() {
    echo -e "${BLUE}🧹 Cleaning up test containers...${NC}"
    docker stop test-backend test-mongo 2>/dev/null || true
    docker rm test-backend test-mongo 2>/dev/null || true
    docker rmi test-backend 2>/dev/null || true
}

# Main test flow
main() {
    echo -e "${YELLOW}🧪 Backend Dockerfile Test Suite${NC}"
    echo "======================================"
    
    # Clean up any existing test containers
    cleanup_test
    
    # Test 1: Build
    if ! test_backend_build; then
        echo -e "${RED}❌ Build test failed. Exiting...${NC}"
        cleanup_test
        exit 1
    fi
    
    # Test 2: Startup and Health Check
    if ! test_backend_startup; then
        echo -e "${RED}❌ Startup test failed. Exiting...${NC}"
        cleanup_test
        exit 1
    fi
    
    # Show container logs for debugging
    echo -e "${BLUE}📋 Backend container logs:${NC}"
    docker logs test-backend
    
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Backend Dockerfile is working correctly.${NC}"
    
    # Clean up
    cleanup_test
}

# Run main function
main
