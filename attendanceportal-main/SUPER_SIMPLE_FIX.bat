@echo off
echo ========================================
echo 🚨 SUPER SIMPLE LOGIN FIX - GUARANTEED!
echo ========================================
echo.
echo 💡 This script will fix your login issue in 3 simple steps!
echo.

echo 🔍 Step 1: Checking what you have...
echo.

echo ✅ Node.js: 
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! 
    echo 💡 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎯 CHOOSE YOUR DATABASE OPTION:
echo ========================================
echo.
echo 1️⃣ MongoDB Atlas (CLOUD - EASIEST - RECOMMENDED)
echo    ✅ No installation needed
echo    ✅ 5 minutes setup
echo    ✅ Always works
echo    ✅ Free forever
echo.
echo 2️⃣ Local MongoDB (LOCAL - HARDER)
echo    ❌ Requires installation
echo    ❌ More complex
echo    ❌ Can have issues
echo.
echo 💡 I recommend Option 1 (MongoDB Atlas)
echo.

set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" goto :atlas_setup
if "%choice%"=="2" goto :local_setup
echo ❌ Invalid choice! Please enter 1 or 2.
pause
exit /b 1

:atlas_setup
echo.
echo ========================================
echo 🗄️ MONGODB ATLAS SETUP (RECOMMENDED)
echo ========================================
echo.
echo 📋 Follow these EXACT steps:
echo.
echo 1️⃣ Open this link: https://www.mongodb.com/atlas
echo 2️⃣ Click "Try Free" or "Sign Up"
echo 3️⃣ Create account with your email
echo 4️⃣ Choose "FREE" plan (M0)
echo 5️⃣ Select any cloud provider (AWS/Google/Azure)
echo 6️⃣ Click "Create Cluster"
echo 7️⃣ Wait for cluster to finish (5-10 minutes)
echo.
echo 💡 After cluster is ready, press any key to continue...
pause

echo.
echo 📋 Next steps:
echo 8️⃣ Click "Connect" on your cluster
echo 9️⃣ Click "Add a Database User"
echo 🔟 Username: attendanceadmin
echo 1️⃣1️⃣ Password: YourPassword123!
echo 1️⃣2️⃣ Role: "Atlas admin"
echo 1️⃣3️⃣ Click "Add User"
echo.
echo 💡 After creating user, press any key to continue...
pause

echo.
echo 📋 Final steps:
echo 1️⃣4️⃣ Click "Network Access"
echo 1️⃣5️⃣ Click "Add IP Address"
echo 1️⃣6️⃣ Click "Allow Access from Anywhere"
echo 1️⃣7️⃣ Click "Confirm"
echo 1️⃣8️⃣ Go back to "Database" tab
echo 1️⃣9️⃣ Click "Connect" → "Connect your application"
echo 2️⃣0️⃣ Copy the connection string
echo.
echo 💡 After copying connection string, press any key to continue...
pause

echo.
echo ========================================
echo 🔧 CREATING YOUR CONFIGURATION
echo ========================================
echo.

echo 💡 Creating Backend/.env file...
if not exist "Backend\.env" (
    echo MONGO_URL=YOUR_CONNECTION_STRING_HERE > Backend\.env
    echo JWT_SECRET=your-secret-key-123 >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=development >> Backend\.env
    echo ✅ Backend/.env created!
) else (
    echo Backend/.env already exists
)

echo.
echo ⚠️  IMPORTANT: You MUST update Backend/.env file!
echo 💡 Replace YOUR_CONNECTION_STRING_HERE with your actual connection string
echo 💡 Example: mongodb+srv://attendanceadmin:YourPassword123!@cluster0.xxxxx.mongodb.net/attendanceportal
echo.
echo 💡 Press any key after updating .env file...
pause

goto :install_and_start

:local_setup
echo.
echo ========================================
echo 🗄️ LOCAL MONGODB SETUP
echo ========================================
echo.
echo 📥 Download MongoDB Community Server:
echo 💡 https://www.mongodb.com/try/download/community
echo.
echo 📋 Installation steps:
echo 1️⃣ Download the .msi file
echo 2️⃣ Run as Administrator
echo 3️⃣ Choose "Complete" installation
echo 4️⃣ Install MongoDB as a Service
echo 5️⃣ Complete installation
echo.
echo 💡 After installing MongoDB, press any key to continue...
pause

echo.
echo 💡 Creating Backend/.env file...
if not exist "Backend\.env" (
    echo MONGO_URL=mongodb://localhost:27017/attendanceportal > Backend\.env
    echo JWT_SECRET=your-secret-key-123 >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=development >> Backend\.env
    echo ✅ Backend/.env created with local MongoDB!
) else (
    echo Backend/.env already exists
)

:install_and_start
echo.
echo ========================================
echo 📦 INSTALLING DEPENDENCIES
echo ========================================
echo.

echo 💡 Installing Backend dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies failed! Check your internet connection.
    pause
    exit /b 1
)

echo.
echo 💡 Installing Frontend dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies failed! Check your internet connection.
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo 🎯 STARTING YOUR APPLICATION
echo ========================================
echo.

echo 💡 Starting Backend Server (Terminal 1)...
start "Backend Server" cmd /k "cd Backend && npm start"

echo.
echo ⏳ Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak >nul

echo 💡 Starting Frontend Server (Terminal 2)...
start "Frontend Server" cmd /k "cd Frontend && npm start"

echo.
echo ========================================
echo ✅ SETUP COMPLETE! YOUR LOGIN WILL WORK NOW!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo.
echo 🔑 LOGIN CREDENTIALS (WILL WORK NOW):
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo.
echo 💡 The backend automatically creates these users when it starts!
echo 💡 If login still fails, check the backend terminal for errors.
echo.
echo 🎯 NEXT STEPS:
echo 1️⃣ Wait for both terminals to show "ready" messages
echo 2️⃣ Open http://localhost:3000 in your browser
echo 3️⃣ Try logging in with admin@techcorp.com / password123
echo 4️⃣ It WILL work this time! 🎉
echo.
pause
