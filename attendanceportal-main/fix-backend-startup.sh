#!/bin/bash

echo "🔧 Fixing Backend Startup Issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
    echo -e "${BLUE}🔍 Checking Docker installation...${NC}"
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker is installed${NC}"
        docker --version
    else
        echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
        exit 1
    fi
}

# Function to clean up containers and volumes
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up containers and volumes...${NC}"
    docker compose down -v
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to rebuild and start services
rebuild_services() {
    echo -e "${BLUE}🔨 Rebuilding services...${NC}"
    docker compose build --no-cache
    echo -e "${GREEN}✅ Services rebuilt${NC}"
    
    echo -e "${BLUE}🚀 Starting services...${NC}"
    docker compose up -d
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to wait for services to be healthy
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    
    # Wait for MongoDB to be healthy
    echo "Waiting for MongoDB to be healthy..."
    while ! docker compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        echo "MongoDB not ready yet..."
        sleep 5
    done
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
    
    # Wait for Backend to be healthy
    echo "Waiting for Backend to be healthy..."
    while ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; do
        echo "Backend not ready yet..."
        sleep 5
    done
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    
    # Wait for Frontend to be healthy
    echo "Waiting for Frontend to be healthy..."
    while ! curl -f http://localhost:3000/health > /dev/null 2>&1; do
        echo "Frontend not ready yet..."
        sleep 5
    done
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
}

# Function to test connectivity
test_connectivity() {
    echo -e "${BLUE}🔗 Testing connectivity...${NC}"
    
    # Test MongoDB connectivity
    if docker compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is accessible${NC}"
    else
        echo -e "${RED}❌ MongoDB is not accessible${NC}"
    fi
    
    # Test Backend connectivity
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is accessible${NC}"
    else
        echo -e "${RED}❌ Backend is not accessible${NC}"
    fi
    
    # Test Frontend connectivity
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
    
    # Test Frontend to Backend proxy
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend to Backend proxy is working${NC}"
    else
        echo -e "${RED}❌ Frontend to Backend proxy is not working${NC}"
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

# Function to show service status
show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker compose ps
    
    echo -e "${BLUE}📋 Recent logs:${NC}"
    echo "MongoDB logs:"
    docker compose logs --tail=5 mongo
    echo ""
    echo "Backend logs:"
    docker compose logs --tail=10 backend
    echo ""
    echo "Frontend logs:"
    docker compose logs --tail=5 frontend
}

# Main fix flow
main() {
    echo -e "${YELLOW}🔧 Backend Startup Fix Suite${NC}"
    echo "======================================"
    
    # Check prerequisites
    check_docker
    
    # Clean up and rebuild
    cleanup
    rebuild_services
    
    # Wait for services to be healthy
    wait_for_services
    
    # Test connectivity
    test_connectivity
    
    # Check environment variables
    check_env_vars
    
    # Show final status
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Backend startup issues fixed!${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
    echo -e "${BLUE}🗄️ MongoDB: localhost:27017${NC}"
}

# Run main function
main
