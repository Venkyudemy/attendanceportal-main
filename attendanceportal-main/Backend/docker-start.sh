#!/bin/sh

# Docker Startup Script for Attendance Portal Backend
# This script ensures proper initialization and configuration

set -e

echo "🚀 Starting Attendance Portal Backend in Docker..."

# Set default timezone if not set
export TZ=${TZ:-Asia/Kolkata}

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Parse host and port from MONGO_URI
MONGO_HOST=$(echo $MONGO_URI | sed -E 's#mongodb://([^:/]+).*#\1#')
MONGO_PORT=$(echo $MONGO_URI | sed -E 's#.*:([0-9]+)/.*#\1#')

if [ -z "$MONGO_HOST" ] || [ -z "$MONGO_PORT" ]; then
  echo "❌ Could not parse MONGO_URI: $MONGO_URI"
  exit 1
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB at $MONGO_HOST:$MONGO_PORT..."
until nc -z "$MONGO_HOST" "$MONGO_PORT"; do
  echo "MongoDB is not ready yet, waiting..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Wait a bit more for MongoDB to fully initialize
sleep 5

# Always run database initialization to ensure admin user exists
echo "🔧 Running database initialization..."
echo "📡 MongoDB URI: $MONGO_URI"

if [ -f /app/scripts/initDatabase.js ]; then
  echo "Running initDatabase.js..."
  node /app/scripts/initDatabase.js
  echo "✅ Database initialization completed"
else
  echo "⚠️  initDatabase.js not found, trying createAdmin.js..."
  if [ -f /app/scripts/createAdmin.js ]; then
    node /app/scripts/createAdmin.js
    echo "✅ Admin user creation completed"
  else
    echo "❌ No database initialization scripts found!"
  fi
fi

# Set proper permissions for logs directory
chmod 755 /app/logs

# Start the application
echo "🎯 Starting Node.js application..."
exec node index.js
