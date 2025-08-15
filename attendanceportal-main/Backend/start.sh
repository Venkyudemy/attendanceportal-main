#!/bin/bash

echo "🚀 Starting Attendance Portal Backend..."

# Set error handling
set -e

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if MongoDB is ready
check_mongodb() {
    log "⏳ Checking MongoDB connectivity..."
    if nc -z mongo 27017 2>/dev/null; then
        log "✅ MongoDB port is accessible"
        return 0
    else
        log "❌ MongoDB port is not accessible"
        return 1
    fi
}

# Wait for MongoDB to be ready with timeout
log "⏳ Waiting for MongoDB to be ready..."
timeout=120
counter=0
while ! check_mongodb; do
    counter=$((counter + 5))
    if [ $counter -ge $timeout ]; then
        log "❌ Timeout waiting for MongoDB after ${timeout} seconds"
        exit 1
    fi
    log "Waiting for MongoDB... (${counter}/${timeout}s)"
    sleep 5
done

log "✅ MongoDB is ready!"

# Additional wait to ensure MongoDB is fully initialized
log "⏳ Ensuring MongoDB is fully initialized..."
sleep 10

# Final MongoDB connection test
log "🔍 Final MongoDB connection test..."
if check_mongodb; then
    log "✅ MongoDB connection test passed!"
else
    log "❌ MongoDB connection test failed!"
    exit 1
fi

# Start the application
log "🔧 Starting Node.js application..."
log "📊 Environment: NODE_ENV=${NODE_ENV:-development}"
log "🌐 Port: ${PORT:-5000}"
log "🗄️ MongoDB URL: ${MONGO_URL:-mongodb://localhost:27017/attendanceportal}"

# Use exec to replace the shell process with node
exec node index.js
