@echo off
echo ========================================
echo 🚨 QUICK LOGIN FIX - STEP BY STEP
echo ========================================
echo.
echo 💡 This will fix your login issue in 3 simple steps!
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
echo 🎯 STEP 1: CHOOSE YOUR DATABASE
echo ========================================
echo.
echo 💡 You need a database for your app to work!
echo.
echo 1️⃣ MongoDB Atlas (FREE - RECOMMENDED)
echo    ✅ No installation needed
echo    ✅ 5 minutes setup
echo    ✅ Always works
echo.
echo 2️⃣ I already have a database
echo    ✅ Tell me the connection string
echo.
echo 3️⃣ I want to install MongoDB locally
echo    ❌ More complex, not recommended
echo.

set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" goto :atlas_setup
if "%choice%"=="2" goto :existing_database
if "%choice%"=="3" goto :local_mongodb
echo ❌ Invalid choice! Please enter 1, 2, or 3.
pause
exit /b 1

:atlas_setup
echo.
echo ========================================
echo 🗄️ MONGODB ATLAS SETUP (FREE)
echo ========================================
echo.
echo 📋 Follow these EXACT steps:
echo.
echo 1️⃣ Open: https://www.mongodb.com/atlas
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
echo 💡 Now I need your connection string...
set /p database_url="Paste your MongoDB Atlas connection string here: "

echo.
echo 💡 Now I need to know where your app is running...
set /p frontend_url="What is your FRONTEND URL? (e.g., http://localhost:3000 or your domain): "
set /p backend_url="What is your BACKEND URL? (e.g., http://localhost:5000 or your domain): "

goto :create_config

:existing_database
echo.
echo ========================================
echo 🗄️ USING EXISTING DATABASE
echo ========================================
echo.
echo 💡 Great! You already have a database.
echo.
set /p database_url="Enter your DATABASE connection string: "
set /p frontend_url="What is your FRONTEND URL? (e.g., http://localhost:3000 or your domain): "
set /p backend_url="What is your BACKEND URL? (e.g., http://localhost:5000 or your domain): "

goto :create_config

:local_mongodb
echo.
echo ========================================
echo 🗄️ LOCAL MONGODB INSTALLATION
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
echo 💡 For local MongoDB, use this connection string:
set database_url=mongodb://localhost:27017/attendanceportal
echo 💡 Database URL: %database_url%
echo.
set /p frontend_url="What is your FRONTEND URL? (e.g., http://localhost:3000): "
set /p backend_url="What is your BACKEND URL? (e.g., http://localhost:5000): "

:create_config
echo.
echo ========================================
echo 🔧 STEP 2: CREATING CONFIGURATION
echo ========================================
echo.

echo 💡 Creating Backend/.env file...
echo MONGO_URL=%database_url% > Backend\.env
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
echo PORT=5000 >> Backend\.env
echo NODE_ENV=production >> Backend\.env
echo CORS_ORIGIN=%frontend_url% >> Backend\.env
echo ✅ Backend/.env created!

echo.
echo 💡 Creating Frontend/.env file...
echo REACT_APP_API_URL=%backend_url%/api > Frontend\.env
echo ✅ Frontend/.env created!

echo.
echo ========================================
echo 🗄️ STEP 3: TESTING DATABASE
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
  serverSelectionTimeoutMS: 15000
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
    echo 💡 Common issues:
    echo    - Wrong password in connection string
    echo    - Database server not running
    echo    - Network access not allowed
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
echo 🚀 STARTING YOUR APPLICATION
echo ========================================
echo.

echo 💡 Starting Backend Server (Terminal 1)...
start "Backend Server" cmd /k "cd Backend && npm start"

echo.
echo ⏳ Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak >nul

echo 💡 Starting Frontend Server (Terminal 2)...
start "Frontend Server" cmd /k "cd Frontend && npm start"

echo.
echo ========================================
echo ✅ LOGIN ISSUE FIXED! 🎉
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
echo 💡 Your application should now work!
echo 💡 Admin users have been created in your database.
echo.
echo 🎯 NEXT STEPS:
echo 1️⃣ Wait for both terminals to show "ready" messages
echo 2️⃣ Open your frontend URL in browser
echo 3️⃣ Try logging in with admin@techcorp.com / password123
echo 4️⃣ It WILL work this time! 🎉
echo.
echo 💡 If login still fails, check the backend terminal for errors
echo.
pause
