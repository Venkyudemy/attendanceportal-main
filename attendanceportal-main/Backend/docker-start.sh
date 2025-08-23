#!/bin/sh

# Docker Startup Script for Attendance Portal Backend
# This script ensures proper initialization and configuration

set -e

echo "🚀 Starting Attendance Portal Backend in Docker..."

# Set default timezone if not set
export TZ=${TZ:-Asia/Kolkata}

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until nc -z mongo 27017; do
  echo "MongoDB is not ready yet, waiting..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Wait a bit more for MongoDB to fully initialize
sleep 5

# Check if we need to run database initialization
if [ ! -f /app/.db-initialized ]; then
  echo "🔧 Running database initialization..."
  
  # Run database initialization scripts if they exist
  if [ -f /app/scripts/initDatabase.js ]; then
    echo "Running initDatabase.js..."
    node /app/scripts/initDatabase.js
  fi
  
  if [ -f /app/scripts/createTestUser.js ]; then
    echo "Running createTestUser.js..."
    node /app/scripts/createTestUser.js
  fi
  
  # Mark database as initialized
  touch /app/.db-initialized
  echo "✅ Database initialization completed"
else
  echo "✅ Database already initialized, skipping..."
fi

# Set proper permissions for logs directory
chmod 755 /app/logs

# Start the application
echo "🎯 Starting Node.js application..."
exec node index.js
