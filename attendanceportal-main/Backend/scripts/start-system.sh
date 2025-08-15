#!/bin/bash

echo "========================================"
echo "   Attendance Portal System Startup"
echo "========================================"
echo

echo "🔍 Checking if Docker is running..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not running"
    echo "Please install Docker and start it"
    exit 1
fi

echo "✅ Docker is available"

echo
echo "🚀 Starting MongoDB container..."
docker-compose up -d mongodb

echo
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

echo
echo "🔗 Testing database connection..."
cd Backend
node scripts/testConnection.js

echo
echo "🚀 Starting backend server..."
gnome-terminal --title="Backend Server" -- bash -c "npm start; exec bash" &
# For macOS, use: open -a Terminal "npm start"
# For other Linux, use: xterm -title "Backend Server" -e "npm start; bash" &

echo
echo "⏳ Waiting for backend to start..."
sleep 5

echo
echo "🌐 Starting frontend..."
cd ../Frontend
gnome-terminal --title="Frontend Server" -- bash -c "npm start; exec bash" &
# For macOS, use: open -a Terminal "npm start"
# For other Linux, use: xterm -title "Frontend Server" -e "npm start; bash" &

echo
echo "========================================"
echo "    System Startup Complete!"
echo "========================================"
echo
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "🗄️  MongoDB:  mongodb://localhost:27017"
echo
echo "👑 Admin Login: admin@techcorp.com / admin123"
echo "👤 Employee Login: employee@techcorp.com / employee123"
echo
echo "Press Enter to exit..."
read
