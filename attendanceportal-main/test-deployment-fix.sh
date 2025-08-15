#!/bin/bash

echo "🧪 Testing Deployment Fixes..."

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

# Function to clean up and rebuild
cleanup_and_rebuild() {
    echo -e "${BLUE}🧹 Cleaning up containers and volumes...${NC}"
    docker compose down -v
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    
    echo -e "${BLUE}🔨 Rebuilding services...${NC}"
    docker compose build --no-cache
    echo -e "${GREEN}✅ Services rebuilt${NC}"
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    docker compose up -d
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to wait for services with detailed monitoring
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    
    # Wait for MongoDB
    echo "Waiting for MongoDB to be healthy..."
    local mongo_timeout=180
    local mongo_counter=0
    while ! docker compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        mongo_counter=$((mongo_counter + 10))
        if [ $mongo_counter -ge $mongo_timeout ]; then
            echo -e "${RED}❌ MongoDB health check timeout after ${mongo_timeout} seconds${NC}"
            docker compose logs mongo
            return 1
        fi
        echo "MongoDB not ready yet... (${mongo_counter}/${mongo_timeout}s)"
        sleep 10
    done
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
    
    # Wait for Backend
    echo "Waiting for Backend to be healthy..."
    local backend_timeout=300
    local backend_counter=0
    while ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; do
        backend_counter=$((backend_counter + 10))
        if [ $backend_counter -ge $backend_timeout ]; then
            echo -e "${RED}❌ Backend health check timeout after ${backend_timeout} seconds${NC}"
            docker compose logs backend
            return 1
        fi
        echo "Backend not ready yet... (${backend_counter}/${backend_timeout}s)"
        sleep 10
    done
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    
    # Wait for Frontend
    echo "Waiting for Frontend to be healthy..."
    local frontend_timeout=120
    local frontend_counter=0
    while ! curl -f http://localhost:3000/health > /dev/null 2>&1; do
        frontend_counter=$((frontend_counter + 10))
        if [ $frontend_counter -ge $frontend_timeout ]; then
            echo -e "${RED}❌ Frontend health check timeout after ${frontend_timeout} seconds${NC}"
            docker compose logs frontend
            return 1
        fi
        echo "Frontend not ready yet... (${frontend_counter}/${frontend_timeout}s)"
        sleep 10
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
        return 1
    fi
    
    # Test Backend connectivity
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is accessible${NC}"
    else
        echo -e "${RED}❌ Backend is not accessible${NC}"
        return 1
    fi
    
    # Test Frontend connectivity
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
        return 1
    fi
    
    # Test Frontend to Backend proxy
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend to Backend proxy is working${NC}"
    else
        echo -e "${RED}❌ Frontend to Backend proxy is not working${NC}"
        return 1
    fi
}

# Function to check container status
check_container_status() {
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker compose ps
    
    echo -e "${BLUE}📋 Container Details:${NC}"
    echo "Backend container:"
    docker compose ps backend
    echo ""
    echo "Frontend container:"
    docker compose ps frontend
    echo ""
    echo "MongoDB container:"
    docker compose ps mongo
}

# Function to check environment variables
check_env_vars() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"
    
    # Check backend environment variables
    echo "Backend environment variables:"
    if docker compose exec backend env | grep -E "(NODE_ENV|PORT|MONGO_URL)" > /dev/null 2>&1; then
        docker compose exec backend env | grep -E "(NODE_ENV|PORT|MONGO_URL)"
        echo -e "${GREEN}✅ Backend environment variables are set${NC}"
    else
        echo -e "${RED}❌ Backend environment variables are not set correctly${NC}"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    echo -e "${BLUE}🔧 Testing API endpoints...${NC}"
    
    # Test backend root endpoint
    if curl -f http://localhost:5000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend root endpoint is working${NC}"
    else
        echo -e "${RED}❌ Backend root endpoint is not working${NC}"
    fi
    
    # Test backend health endpoint
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health endpoint is working${NC}"
    else
        echo -e "${RED}❌ Backend health endpoint is not working${NC}"
    fi
    
    # Test frontend health endpoint
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend health endpoint is working${NC}"
    else
        echo -e "${RED}❌ Frontend health endpoint is not working${NC}"
    fi
}

# Function to show recent logs
show_logs() {
    echo -e "${BLUE}📋 Recent logs:${NC}"
    echo "MongoDB logs (last 10 lines):"
    docker compose logs --tail=10 mongo
    echo ""
    echo "Backend logs (last 15 lines):"
    docker compose logs --tail=15 backend
    echo ""
    echo "Frontend logs (last 10 lines):"
    docker compose logs --tail=10 frontend
}

# Main test function
main() {
    echo -e "${YELLOW}🧪 Deployment Fix Test Suite${NC}"
    echo "======================================"
    
    # Check prerequisites
    check_docker
    
    # Clean up and rebuild
    cleanup_and_rebuild
    
    # Start services
    start_services
    
    # Wait for services to be healthy
    if ! wait_for_services; then
        echo -e "${RED}❌ Service health check failed${NC}"
        show_logs
        exit 1
    fi
    
    # Test connectivity
    if ! test_connectivity; then
        echo -e "${RED}❌ Connectivity test failed${NC}"
        show_logs
        exit 1
    fi
    
    # Check container status
    check_container_status
    
    # Check environment variables
    if ! check_env_vars; then
        echo -e "${RED}❌ Environment variables check failed${NC}"
        exit 1
    fi
    
    # Test API endpoints
    test_api_endpoints
    
    # Show logs
    show_logs
    
    echo ""
    echo -e "${GREEN}🎉 All deployment tests passed!${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
    echo -e "${BLUE}🗄️ MongoDB: localhost:27017${NC}"
    echo ""
    echo -e "${YELLOW}✅ Backend container is now running and healthy!${NC}"
}

# Run main function
main
