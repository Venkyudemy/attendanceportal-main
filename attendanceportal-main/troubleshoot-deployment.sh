#!/bin/bash

echo "🔧 Troubleshooting Attendance Portal Deployment..."

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
        echo "Please install Docker Desktop or Docker Engine"
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    echo -e "${BLUE}🔍 Checking Docker Compose...${NC}"
    if docker compose version &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose is available${NC}"
        docker compose version
    else
        echo -e "${RED}❌ Docker Compose is not available${NC}"
        echo "Please ensure Docker Compose is installed"
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

# Function to check service status
check_services() {
    echo -e "${BLUE}📊 Checking service status...${NC}"
    docker compose ps
    
    echo -e "${BLUE}📋 Service logs summary:${NC}"
    echo "MongoDB logs:"
    docker compose logs --tail=5 mongo
    echo ""
    echo "Backend logs:"
    docker compose logs --tail=10 backend
    echo ""
    echo "Frontend logs:"
    docker compose logs --tail=5 frontend
}

# Function to test connectivity
test_connectivity() {
    echo -e "${BLUE}🔗 Testing connectivity...${NC}"
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Test MongoDB
    echo "Testing MongoDB..."
    if docker compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is accessible${NC}"
    else
        echo -e "${RED}❌ MongoDB is not accessible${NC}"
    fi
    
    # Test Backend
    echo "Testing Backend..."
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is accessible${NC}"
    else
        echo -e "${RED}❌ Backend is not accessible${NC}"
    fi
    
    # Test Frontend
    echo "Testing Frontend..."
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
}

# Function to show detailed logs
show_detailed_logs() {
    echo -e "${BLUE}📋 Detailed logs:${NC}"
    echo "Press Ctrl+C to stop viewing logs"
    docker compose logs -f
}

# Main troubleshooting flow
main() {
    echo -e "${YELLOW}🔧 Attendance Portal Deployment Troubleshooter${NC}"
    echo "=================================================="
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Ask user what they want to do
    echo ""
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1) Clean up and rebuild everything"
    echo "2) Check current service status"
    echo "3) Test connectivity"
    echo "4) Show detailed logs"
    echo "5) Exit"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            cleanup
            rebuild_services
            check_services
            test_connectivity
            ;;
        2)
            check_services
            ;;
        3)
            test_connectivity
            ;;
        4)
            show_detailed_logs
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Exiting..."
            exit 1
            ;;
    esac
}

# Run main function
main
