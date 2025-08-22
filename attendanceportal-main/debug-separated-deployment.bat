@echo off
echo 🔍 Separated Deployment Diagnostic Tool
echo ======================================
echo.

echo 📋 Please provide the following information:
echo.

set /p BACKEND_IP="Enter Backend Server Private IP: "
set /p MONGODB_IP="Enter MongoDB Server Private IP: "
set /p FRONTEND_IP="Enter Frontend Server Public IP: "

echo.
echo 🔍 Running diagnostics...
echo.

echo 1️⃣ Testing Backend Connectivity...
curl -X GET http://%BACKEND_IP%:5000/api/health --connect-timeout 10 --max-time 15
if %errorlevel% neq 0 (
    echo ❌ Backend connectivity failed
    echo 💡 Check if backend is running on port 5000
    echo 💡 Check security groups allow port 5000
) else (
    echo ✅ Backend connectivity successful
)

echo.
echo 2️⃣ Testing MongoDB Connectivity from Backend...
echo 🔗 Attempting to connect to MongoDB...
curl -X POST http://%BACKEND_IP%:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@techcorp.com\",\"password\":\"password123\"}" --connect-timeout 10 --max-time 15
if %errorlevel% neq 0 (
    echo ❌ MongoDB connectivity failed
    echo 💡 Check if MongoDB is running on port 27017
    echo 💡 Check if admin user exists in database
) else (
    echo ✅ MongoDB connectivity successful
)

echo.
echo 3️⃣ Testing Login API...
curl -X POST http://%BACKEND_IP%:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@techcorp.com\",\"password\":\"password123\"}" --connect-timeout 10 --max-time 15
if %errorlevel% neq 0 (
    echo ❌ Login API failed
    echo 💡 Check backend authentication routes
) else (
    echo ✅ Login API successful
)

echo.
echo 4️⃣ Checking CORS Configuration...
curl -X OPTIONS http://%BACKEND_IP%:5000/api/auth/login -H "Origin: http://%FRONTEND_IP%" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" --connect-timeout 10 --max-time 15
if %errorlevel% neq 0 (
    echo ❌ CORS preflight failed
    echo 💡 Update CORS configuration in backend
) else (
    echo ✅ CORS configuration looks good
)

echo.
echo 📊 Diagnostic Summary:
echo =====================
echo Backend IP: %BACKEND_IP%
echo MongoDB IP: %MONGODB_IP%
echo Frontend IP: %FRONTEND_IP%
echo.

echo 🔧 Next Steps:
echo 1. Create Frontend/.env.production with REACT_APP_API_URL=http://%BACKEND_IP%:5000/api
echo 2. Create Backend/.env with MONGO_URL=mongodb://%MONGODB_IP%:27017/attendanceportal
echo 3. Update CORS configuration in Backend/index.js
echo 4. Ensure admin user exists in database
echo 5. Check security groups allow necessary traffic
echo.

echo 📖 See SEPARATED_DEPLOYMENT_FIX.md for detailed instructions
echo.

pause
