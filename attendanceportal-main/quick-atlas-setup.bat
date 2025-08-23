@echo off
echo ========================================
echo 🚀 Quick MongoDB Atlas Setup
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
echo ========================================
echo 📋 MongoDB Atlas Setup (5 minutes):
echo ========================================
echo.
echo 1️⃣ Go to: https://www.mongodb.com/atlas
echo 2️⃣ Sign up for FREE account
echo 3️⃣ Create FREE cluster (M0)
echo 4️⃣ Create database user: attendanceadmin
echo 5️⃣ Allow network access from anywhere
echo 6️⃣ Get connection string
echo.

echo 💡 After getting connection string, press any key to continue...
pause

echo.
echo ========================================
echo 🔧 Creating Backend/.env file...
echo ========================================
echo.

if not exist "Backend\.env" (
    echo Creating Backend/.env file...
    echo MONGO_URL=YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE > Backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=development >> Backend\.env
    echo.
    echo ⚠️  IMPORTANT: Update Backend/.env with your actual MongoDB Atlas connection string!
    echo.
) else (
    echo Backend/.env already exists.
)

echo.
echo ========================================
echo 📦 Installing Dependencies...
echo ========================================
echo.

echo Installing Backend dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo Installing Frontend dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo 🎯 Starting Application...
echo ========================================
echo.

echo 💡 Starting Backend (Terminal 1)...
start "Backend Server" cmd /k "cd Backend && npm start"

echo.
echo ⏳ Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

echo 💡 Starting Frontend (Terminal 2)...
start "Frontend Server" cmd /k "cd Frontend && npm start"

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo.
echo 🔑 Login Credentials:
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo.
echo 💡 Make sure to update Backend/.env with your MongoDB Atlas connection string!
echo 💡 The backend will automatically create admin users when it starts.
echo.
pause
