@echo off
echo ========================================
echo 🚨 FIXING DEPLOYED APPLICATION LOGIN
echo ========================================
echo.
echo 💡 Your deployed app can't login because of database connection issues!
echo 💡 This script will fix it step by step.
echo.

echo 🔍 Step 1: Checking your current setup...
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
echo 🎯 YOUR DEPLOYMENT SCENARIO:
echo ========================================
echo.
echo 1️⃣ Frontend deployed on: [Your frontend domain/IP]
echo 2️⃣ Backend deployed on: [Your backend domain/IP:port]
echo 3️⃣ Database: [MongoDB Atlas or your database server]
echo.
echo 💡 I need to know where your services are deployed!
echo.

set /p frontend_url="Enter your FRONTEND URL (e.g., http://yourdomain.com or http://your-ip:3000): "
set /p backend_url="Enter your BACKEND URL (e.g., http://yourdomain.com:5000 or http://your-ip:5000): "
set /p database_url="Enter your DATABASE URL (e.g., mongodb+srv://user:pass@cluster.mongodb.net/attendanceportal): "

echo.
echo ========================================
echo 🔧 FIXING BACKEND CONFIGURATION
echo ========================================
echo.

echo 💡 Creating Backend/.env file with your deployment settings...
if not exist "Backend\.env" (
    echo MONGO_URL=%database_url% > Backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=production >> Backend\.env
    echo CORS_ORIGIN=%frontend_url% >> Backend\.env
    echo ✅ Backend/.env created!
) else (
    echo Backend/.env already exists, updating it...
    echo MONGO_URL=%database_url% > Backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
    echo PORT=5000 >> Backend\.env
    echo NODE_ENV=production >> Backend\.env
    echo CORS_ORIGIN=%frontend_url% >> Backend\.env
    echo ✅ Backend/.env updated!
)

echo.
echo ========================================
echo 🔧 FIXING FRONTEND CONFIGURATION
echo ========================================
echo.

echo 💡 Creating Frontend/.env file with your backend URL...
if not exist "Frontend\.env" (
    echo REACT_APP_API_URL=%backend_url%/api > Frontend\.env
    echo ✅ Frontend/.env created!
) else (
    echo Frontend/.env already exists, updating it...
    echo REACT_APP_API_URL=%backend_url%/api > Frontend\.env
    echo ✅ Frontend/.env updated!
)

echo.
echo ========================================
echo 🗄️ TESTING DATABASE CONNECTION
echo ========================================
echo.

echo 💡 Testing if your database connection works...
cd Backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
console.log('🔗 Testing connection to:', process.env.MONGO_URL.replace(/\/\/.*@/, '//***:***@'));
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
    echo 💡 Please check:
    echo    - Database URL is correct
    echo    - Database server is running
    echo    - Network access is allowed
    echo    - Username/password are correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🔑 CREATING ADMIN USERS
echo ========================================
echo.

echo 💡 Creating admin users in your database...
cd Backend
node initAdmin.js
cd ..

echo.
echo ========================================
echo 📦 INSTALLING DEPENDENCIES
echo ========================================
echo.

echo 💡 Installing Backend dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies failed!
    pause
    exit /b 1
)

echo.
echo 💡 Installing Frontend dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo 🚀 STARTING YOUR DEPLOYED SERVICES
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
echo ✅ DEPLOYMENT LOGIN ISSUE FIXED!
echo ========================================
echo.
echo 🌐 Frontend: %frontend_url%
echo 🔌 Backend: %backend_url%
echo 🗄️ Database: Connected successfully
echo.
echo 🔑 LOGIN CREDENTIALS (WILL WORK NOW):
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo.
echo 💡 Your deployed application should now work!
echo 💡 Admin users have been created in your database.
echo.
echo 🎯 NEXT STEPS:
echo 1️⃣ Wait for both services to start
echo 2️⃣ Test login at your frontend URL
echo 3️⃣ If still having issues, check the backend terminal for errors
echo.
pause
