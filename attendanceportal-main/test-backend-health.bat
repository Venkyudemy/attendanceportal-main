@echo off
echo 🧪 Testing Backend Health and Connectivity...

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Test 1: Check if all containers are running
echo.
echo 🔍 Checking container status:
docker compose ps

REM Test 2: Check environment variables
echo.
echo 🔍 Checking environment variables...
echo Checking MONGO_URL...
docker compose exec backend env | findstr MONGO_URL
if !ERRORLEVEL! EQU 0 (
    echo ✅ MONGO_URL is set
) else (
    echo ❌ MONGO_URL is not set
)

echo Checking NODE_ENV...
docker compose exec backend env | findstr NODE_ENV
if !ERRORLEVEL! EQU 0 (
    echo ✅ NODE_ENV is set to production
) else (
    echo ❌ NODE_ENV is not set correctly
)

REM Test 3: Check MongoDB connectivity
echo.
echo 🗄️ Testing MongoDB connectivity...
docker compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
    echo 📋 MongoDB logs:
    docker compose logs --tail=10 mongo
)

REM Test 4: Check backend connectivity
echo.
echo 🔧 Testing backend connectivity...
echo Testing Backend Root endpoint...
curl -s http://localhost:5000/
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend Root endpoint PASS
) else (
    echo ❌ Backend Root endpoint FAIL
)

echo Testing Backend Health check...
curl -s http://localhost:5000/api/health
if !ERRORLEVEL! EQU 0 (
    echo ✅ Backend Health check PASS
) else (
    echo ❌ Backend Health check FAIL
)

REM Test 5: Check frontend to backend proxy
echo.
echo 🔗 Testing frontend to backend proxy...
echo Testing Frontend API proxy to backend...
curl -s http://localhost:3000/api/health
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend API proxy PASS
) else (
    echo ❌ Frontend API proxy FAIL
)

REM Test 6: Check backend logs for errors
echo.
echo 📋 Checking backend logs for errors...
docker compose logs backend | findstr /i "error failed exception"
if !ERRORLEVEL! EQU 0 (
    echo ❌ Errors found in backend logs
) else (
    echo ✅ No errors found in backend logs
)

REM Test 7: Check MongoDB connection in backend logs
echo.
echo 🔍 Checking MongoDB connection in backend logs...
docker compose logs backend | findstr /i "connected to mongodb"
if !ERRORLEVEL! EQU 0 (
    echo ✅ MongoDB connection successful
) else (
    echo ❌ MongoDB connection not found in logs
    echo 📋 Recent backend logs:
    docker compose logs --tail=20 backend
)

echo.
echo 🎉 Backend health test completed!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
pause
