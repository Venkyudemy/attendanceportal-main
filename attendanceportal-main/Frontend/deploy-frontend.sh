#!/bin/bash

# Frontend Deployment Script
# Usage: ./deploy-frontend.sh <BACKEND_PRIVATE_IP>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <BACKEND_PRIVATE_IP>"
    echo "Example: $0 10.0.1.20"
    exit 1
fi

BACKEND_PRIVATE_IP=$1

echo "🚀 Deploying Frontend with Backend IP: $BACKEND_PRIVATE_IP"

# Create nginx.conf with the backend IP
echo "📝 Creating Nginx configuration..."
sed "s/BACKEND_PRIVATE_IP/$BACKEND_PRIVATE_IP/g" nginx.conf.template > nginx.conf

echo "✅ Nginx configuration created with backend IP: $BACKEND_PRIVATE_IP"

# Update docker-compose.yml with the backend IP
echo "📝 Updating Docker Compose configuration..."
sed -i "s/<BACKEND_PRIVATE_IP>/$BACKEND_PRIVATE_IP/g" docker-compose.frontend.yml

echo "✅ Docker Compose updated with backend IP: $BACKEND_PRIVATE_IP"

# Copy the frontend compose file to the main docker-compose.yml
cp docker-compose.frontend.yml docker-compose.yml

echo "🚀 Starting Frontend container..."
docker-compose up -d

echo "✅ Frontend deployment completed!"
echo "🌐 Frontend should be available at: http://localhost:3000"
echo "🔗 Backend API endpoint: http://$BACKEND_PRIVATE_IP:5000/api"

# Show container status
echo "📊 Container status:"
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=10
