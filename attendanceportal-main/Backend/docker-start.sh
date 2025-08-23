#!/bin/sh

# Docker Startup Script for Attendance Portal Backend
# This script ensures proper initialization and admin user creation

set -e

echo "🚀 Starting Attendance Portal Backend in Docker..."

# Set default timezone if not set
export TZ=${TZ:-UTC}

# Create logs directory if it doesn't exist
mkdir -p /app/logs
chmod 755 /app/logs

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until nc -z mongo 27017; do
  echo "MongoDB is not ready yet, waiting..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Wait a bit more for MongoDB to fully initialize
sleep 10

# Always ensure admin user exists
echo "🔧 Ensuring admin user exists..."
echo "📡 MongoDB URI: $MONGO_URL"

# Run our fixed admin initialization script
if [ -f "initAdmin.js" ]; then
  echo "📝 Found initAdmin.js, running it..."
  node initAdmin.js
  if [ $? -eq 0 ]; then
    echo "✅ Admin user creation completed successfully"
  else
    echo "⚠️  Admin user creation failed, but continuing..."
  fi
else
  echo "⚠️  initAdmin.js not found, trying alternative scripts..."
  
  # Try alternative scripts if initAdmin.js is not found
  if [ -f "startup-admin-creation.js" ]; then
    echo "📝 Found startup-admin-creation.js, running it..."
    node -e "require('./startup-admin-creation').ensureAdminUserExists().then(() => console.log('✅ Admin creation completed')).catch(console.error)"
  elif [ -f "create-admin-manual.js" ]; then
    echo "📝 Found create-admin-manual.js, running it..."
    node create-admin-manual.js
  else
    echo "❌ No admin creation scripts found!"
    echo "💡 Admin user should be created by MongoDB init script"
  fi
fi

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads
chmod 755 /app/uploads

# Start the application
echo "🎯 Starting Node.js application..."
exec node index.js
