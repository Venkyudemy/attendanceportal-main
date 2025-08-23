@echo off
echo ========================================
echo 🚀 Local Setup Without Docker
echo ========================================
echo.

echo 🔍 Checking prerequisites...
echo.

echo ✅ Node.js: 
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo ❌ MongoDB: Not installed locally
echo 💡 You need to install MongoDB to run this application
echo.

echo ========================================
echo 📋 MongoDB Installation Options:
echo ========================================
echo.
echo 🎯 Option 1: MongoDB Community Server (Recommended)
echo    📥 Download: https://www.mongodb.com/try/download/community
echo    🔧 Install as a service
echo    🌐 Default URL: mongodb://localhost:27017
echo.
echo 🎯 Option 2: MongoDB Atlas (Cloud - Free)
echo    📥 Sign up: https://www.mongodb.com/atlas
echo    🔗 Get connection string
echo    🌐 Update Backend/.env file
echo.
echo 🎯 Option 3: Use existing MongoDB server
echo    🔗 Update Backend/.env with your MongoDB URL
echo.

echo ========================================
echo 🔧 Quick Setup Steps:
echo ========================================
echo.
echo 1️⃣ Install MongoDB (Option 1 or 2 above)
echo.
echo 2️⃣ Create Backend/.env file with:
echo    MONGO_URL=mongodb://localhost:27017/attendanceportal
echo    JWT_SECRET=your-secret-key
echo    PORT=5000
echo.
echo 3️⃣ Install backend dependencies:
echo    cd Backend
echo    npm install
echo.
echo 4️⃣ Install frontend dependencies:
echo    cd Frontend
echo    npm install
echo.
echo 5️⃣ Start backend:
echo    cd Backend
echo    npm start
echo.
echo 6️⃣ Start frontend (new terminal):
echo    cd Frontend
echo    npm start
echo.

echo ========================================
echo 🎯 After MongoDB is installed:
echo ========================================
echo.
echo 💡 Run this script again to continue setup
echo 💡 Or run: setup-local-continue.bat
echo.

pause
