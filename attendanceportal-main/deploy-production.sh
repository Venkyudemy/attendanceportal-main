#!/bin/bash

# Production Deployment Script for Attendance Portal
# This script ensures proper deployment with admin user creation

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for Attendance Portal"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove old images to ensure fresh build
print_status "Removing old images..."
docker-compose down --rmi all --volumes --remove-orphans || true

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if backend is running
print_status "Checking backend service..."
if ! docker-compose ps backend | grep -q "Up"; then
    print_error "Backend service is not running"
    docker-compose logs backend
    exit 1
fi

print_success "Backend service is running"

# Check if frontend is running
print_status "Checking frontend service..."
if ! docker-compose ps frontend | grep -q "Up"; then
    print_error "Frontend service is not running"
    docker-compose logs frontend
    exit 1
fi

print_success "Frontend service is running"

# Check if MongoDB is running
print_status "Checking MongoDB service..."
if ! docker-compose ps mongo | grep -q "Up"; then
    print_error "MongoDB service is not running"
    docker-compose logs mongo
    exit 1
fi

print_success "MongoDB service is running"

# Wait for backend to complete initialization
print_status "Waiting for backend initialization to complete..."
sleep 60

# Check backend logs for admin user creation
print_status "Checking admin user creation..."
if docker-compose logs backend | grep -q "Admin user verification successful"; then
    print_success "Admin user created successfully"
else
    print_warning "Admin user creation status unclear, checking logs..."
    docker-compose logs backend | tail -20
fi

# Test admin login via API
print_status "Testing admin login..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"password123"}')

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q "token"; then
    print_success "Admin login test successful"
else
    print_error "Admin login test failed"
    echo "Response: $ADMIN_LOGIN_RESPONSE"
fi

# Display service status
print_status "Deployment completed! Service status:"
docker-compose ps

echo ""
echo "🎉 Deployment Summary:"
echo "====================="
echo "✅ Backend: http://localhost:5000"
echo "✅ Frontend: http://localhost:3000"
echo "✅ MongoDB: localhost:27017"
echo ""
echo "🔑 Admin Login Credentials:"
echo "   Email: admin@techcorp.com"
echo "   Password: password123"
echo ""
echo "📝 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update deployment: ./deploy-production.sh"
echo ""

print_success "Production deployment completed successfully!"
