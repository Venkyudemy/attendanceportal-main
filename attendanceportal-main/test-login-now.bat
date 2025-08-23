@echo off
echo ========================================
echo 🧪 TESTING YOUR LOGIN - QUICK CHECK
echo ========================================
echo.

echo 🔍 Checking if your application is running...
echo.

echo 🌐 Testing Frontend (http://localhost:3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:3000
) else (
    echo ❌ Frontend is NOT running
    echo 💡 Start it with: cd Frontend && npm start
)

echo.
echo 🔌 Testing Backend API (http://localhost:5000)...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is running at http://localhost:5000
) else (
    echo ❌ Backend API is NOT running
    echo 💡 Start it with: cd Backend && npm start
)

echo.
echo 🗄️ Testing MongoDB Connection...
if exist "Backend\.env" (
    echo ✅ Backend/.env file exists
    echo 💡 Checking MongoDB connection...
    cd Backend
    node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal')
      .then(() => console.log('✅ MongoDB connected successfully!'))
      .catch(err => console.log('❌ MongoDB connection failed:', err.message));
    "
    cd ..
) else (
    echo ❌ Backend/.env file NOT found
    echo 💡 Run SUPER_SIMPLE_FIX.bat first
)

echo.
echo ========================================
echo 🎯 LOGIN TEST INSTRUCTIONS:
echo ========================================
echo.
echo 1️⃣ Open your browser
echo 2️⃣ Go to: http://localhost:3000
echo 3️⃣ Try logging in with:
echo    👑 Email: admin@techcorp.com
echo    🔑 Password: password123
echo.
echo 💡 If login fails, check the backend terminal for error messages
echo 💡 Make sure both frontend and backend are running
echo.
pause
