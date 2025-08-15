#!/bin/bash

echo "🚀 Starting Attendance Portal Backend..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until nc -z mongo 27017; do
    echo "Waiting for MongoDB..."
    sleep 2
done
echo "✅ MongoDB is ready!"

# Additional wait to ensure MongoDB is fully initialized
echo "⏳ Ensuring MongoDB is fully initialized..."
sleep 5

# Test MongoDB connection using netcat (port connectivity)
echo "🔍 Testing MongoDB connection..."
until nc -z mongo 27017; do
    echo "Testing MongoDB connection..."
    sleep 2
done
echo "✅ MongoDB connection test passed!"

# Start the application
echo "🔧 Starting Node.js application..."
exec node index.js
