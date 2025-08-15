#!/bin/bash

echo "🚀 Starting Attendance Portal Frontend..."

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
until curl -f http://backend:5000/api/health > /dev/null 2>&1; do
    echo "Waiting for backend service..."
    sleep 2
done
echo "✅ Backend is ready!"

# Create necessary directories with proper permissions
echo "📁 Setting up directories and permissions..."
mkdir -p /var/log/nginx /var/cache/nginx /tmp/nginx
chown -R nginx:nginx /var/log/nginx /var/cache/nginx /tmp/nginx /usr/share/nginx/html
chmod -R 755 /var/log/nginx /var/cache/nginx /tmp/nginx

# Test nginx configuration
echo "🔧 Testing nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
echo "✅ Nginx configuration is valid!"

# Start nginx
echo "🌐 Starting nginx..."
nginx -g "daemon off;"
