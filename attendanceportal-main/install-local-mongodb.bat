@echo off
echo ========================================
echo 🗄️ Local MongoDB Installation Guide
echo ========================================
echo.

echo 🔍 Checking if MongoDB is already installed...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is already installed!
    echo.
    echo 💡 Version:
    mongod --version
    echo.
    goto :start_mongodb
)

echo ❌ MongoDB is not installed locally.
echo.

echo ========================================
echo 📥 MongoDB Installation Options:
echo ========================================
echo.
echo 🎯 Option 1: MongoDB Community Server
echo    📥 Download: https://www.mongodb.com/try/download/community
echo    🔧 Install as a Windows Service
echo    🌐 Default URL: mongodb://localhost:27017
echo.
echo 🎯 Option 2: MongoDB via Chocolatey (if installed)
echo    📦 Run: choco install mongodb
echo.
echo 🎯 Option 3: MongoDB via Scoop (if installed)
echo    📦 Run: scoop install mongodb
echo.

echo 💡 After installing MongoDB, press any key to continue...
pause

:start_mongodb
echo.
echo ========================================
echo 🚀 Starting MongoDB...
echo ========================================
echo.

echo 🔍 Checking if MongoDB service is running...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service found, starting it...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo ✅ MongoDB service started successfully!
    ) else (
        echo ❌ Failed to start MongoDB service
        echo 💡 Try starting it manually from Services
    )
) else (
    echo ℹ️  MongoDB service not found, trying to start mongod directly...
    echo 💡 This will start MongoDB in the foreground
    echo 💡 Press Ctrl+C to stop it when done
    echo.
    echo 🚀 Starting MongoDB...
    mongod --dbpath C:\data\db
)

echo.
echo ========================================
echo 🔧 Setting up Application...
echo ========================================
echo.

echo 💡 Creating Backend/.env file...
if not exist "Backend\.env" (
    echo MONGO_URL=mongodb://localhost:27017/attendanceportal > Backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=development >> Backend\.env
    echo ✅ Backend/.env created with local MongoDB URL
) else (
    echo Backend/.env already exists
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
echo 🗄️ MongoDB: mongodb://localhost:27017
echo.
echo 🔑 Login Credentials:
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo.
echo 💡 The backend will automatically create admin users when it starts.
echo 💡 Make sure MongoDB is running before starting the backend.
echo.
pause
