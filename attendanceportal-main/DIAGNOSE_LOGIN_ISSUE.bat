@echo off
echo ========================================
echo 🔍 DIAGNOSING YOUR LOGIN ISSUE
echo ========================================
echo.
echo 💡 This script will check what's wrong and tell you exactly how to fix it!
echo.

echo 🔍 Checking your current setup...
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
echo 📁 CHECKING CONFIGURATION FILES
echo ========================================
echo.

if exist "Backend\.env" (
    echo ✅ Backend/.env exists
    echo 💡 Contents:
    type Backend\.env
) else (
    echo ❌ Backend/.env MISSING!
    echo 💡 This is why you can't login!
    echo 💡 Run QUICK_LOGIN_FIX.bat to create it
)

echo.
if exist "Frontend\.env" (
    echo ✅ Frontend/.env exists
    echo 💡 Contents:
    type Frontend\.env
) else (
    echo ❌ Frontend/.env MISSING!
    echo 💡 This is why frontend can't reach backend!
    echo 💡 Run QUICK_LOGIN_FIX.bat to create it
)

echo.
echo ========================================
echo 🗄️ CHECKING DATABASE CONNECTION
echo ========================================
echo.

if exist "Backend\.env" (
    echo 💡 Testing database connection...
    cd Backend
    node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    console.log('🔗 Testing connection to:', process.env.MONGO_URL ? process.env.MONGO_URL.replace(/\/\/.*@/, '//***:***@') : 'NOT SET');
    if (!process.env.MONGO_URL) {
      console.log('❌ MONGO_URL not set in .env file!');
      process.exit(1);
    }
    mongoose.connect(process.env.MONGO_URL, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    })
    .then(() => {
      console.log('✅ Database connection successful!');
      console.log('📊 Database:', mongoose.connection.db.databaseName);
      console.log('🌐 Host:', mongoose.connection.host);
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Database connection failed:', err.message);
      console.log('💡 Check your database URL and network access');
      process.exit(1);
    });
    "
    cd ..
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Database connection failed!
        echo 💡 This is why you can't login!
    ) else (
        echo.
        echo ✅ Database connection successful!
        echo 💡 Database is working fine
    )
) else (
    echo ❌ Cannot test database - no .env file
)

echo.
echo ========================================
echo 🔑 CHECKING ADMIN USERS
echo ========================================
echo.

if exist "Backend\.env" (
    echo 💡 Checking if admin users exist...
    cd Backend
    node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    const Employee = require('./models/Employee');
    mongoose.connect(process.env.MONGO_URL, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    })
    .then(async () => {
      try {
        const admin = await Employee.findOne({email: 'admin@techcorp.com'});
        const employee = await Employee.findOne({email: 'venkatesh@gmail.com'});
        console.log('👑 Admin user:', admin ? '✅ Exists' : '❌ Missing');
        console.log('👤 Employee user:', employee ? '✅ Exists' : '❌ Missing');
        if (!admin || !employee) {
          console.log('💡 Run: node initAdmin.js to create users');
        }
        process.exit(0);
      } catch (err) {
        console.log('❌ Error checking users:', err.message);
        process.exit(1);
      }
    })
    .catch(err => {
      console.log('❌ Database connection failed:', err.message);
      process.exit(1);
    });
    "
    cd ..
) else (
    echo ❌ Cannot check users - no .env file
)

echo.
echo ========================================
echo 🌐 CHECKING SERVICES
echo ========================================
echo.

echo 💡 Checking if services are running...
echo.

echo 🌐 Frontend (Port 3000):
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on port 3000
) else (
    echo ❌ Frontend is NOT running on port 3000
)

echo.
echo 🔌 Backend (Port 5000):
netstat -an | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 5000
) else (
    echo ❌ Backend is NOT running on port 5000
)

echo.
echo ========================================
echo 🎯 DIAGNOSIS RESULTS
echo ========================================
echo.

echo 💡 Based on the checks above, here's what's wrong:
echo.

if not exist "Backend\.env" (
    echo ❌ PROBLEM 1: Missing Backend/.env file
    echo 💡 SOLUTION: Run QUICK_LOGIN_FIX.bat
    echo.
)

if not exist "Frontend\.env" (
    echo ❌ PROBLEM 2: Missing Frontend/.env file
    echo 💡 SOLUTION: Run QUICK_LOGIN_FIX.bat
    echo.
)

echo.
echo ========================================
echo 🚀 QUICK FIX INSTRUCTIONS
echo ========================================
echo.
echo 💡 To fix your login issue immediately:
echo.
echo 1️⃣ Run QUICK_LOGIN_FIX.bat
echo 2️⃣ Follow the step-by-step instructions
echo 3️⃣ Choose MongoDB Atlas (recommended)
echo 4️⃣ Wait for setup to complete
echo 5️⃣ Your login will work! 🎉
echo.
echo 💡 This script will:
echo    ✅ Create all necessary .env files
echo    ✅ Set up your database connection
echo    ✅ Create admin users
echo    ✅ Start your services
echo    ✅ Fix your login issue completely
echo.
pause
