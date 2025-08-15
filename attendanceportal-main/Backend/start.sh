#!/bin/bash

echo "🚀 Starting Attendance Portal Backend..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until nc -z mongo 27017; do
  echo "Waiting for MongoDB..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Start the application
echo "🔧 Starting Node.js application..."
npm start
