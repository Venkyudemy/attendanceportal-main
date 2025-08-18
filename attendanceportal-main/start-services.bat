@echo off
echo 🚀 Starting Attendance Portal Services...
echo.

REM Stop any existing Node.js processes
echo 🛑 Stopping existing Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak >nul

REM Check if Node.js is installed
echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Start Backend
echo.
echo 🚀 Starting Backend Server...
cd Backend

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found in Backend directory
    pause
    exit /b 1
)

REM Install dependencies if needed
echo 📦 Installing backend dependencies...
npm install

REM Start backend in a new window
echo 🚀 Starting backend server on port 5000...
start "Backend Server" cmd /k "echo Starting Backend Server... && npm start"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

REM Check if backend is running
netstat -an | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ✅ Backend server is running on port 5000
) else (
    echo ❌ Backend server failed to start
    echo Check the backend window for error messages
)

REM Start Frontend
echo.
echo 🚀 Starting Frontend Server...
cd ..\Frontend

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found in Frontend directory
    pause
    exit /b 1
)

REM Install dependencies if needed
echo 📦 Installing frontend dependencies...
npm install

REM Start frontend in a new window
echo 🚀 Starting frontend server on port 3000...
start "Frontend Server" cmd /k "echo Starting Frontend Server... && npm start"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 15 /nobreak >nul

REM Check if frontend is running
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend server is running on port 3000
) else (
    echo ❌ Frontend server failed to start
    echo Check the frontend window for error messages
)

echo.
echo 🎉 Services startup complete!
echo.
echo 🌐 Access your application at:
echo    http://localhost:3000
echo    or
echo    http://10.140.94.16:3000
echo.
echo 🔑 Login Credentials:
echo    Admin: admin@techcorp.com / password123
echo    Employee: venkatesh@gmail.com / venkatesh
echo.
echo 📋 Service Status:
netstat -an | findstr ":5000\|:3000"
echo.
echo 🔧 If services are not running:
echo    1. Check the command windows for error messages
echo    2. Make sure MongoDB is running (if using local database)
echo    3. Check if ports 5000 and 3000 are available
echo.
pause
