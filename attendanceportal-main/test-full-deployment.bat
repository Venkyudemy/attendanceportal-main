@echo off
echo 🧪 Testing Full Deployment - Frontend, Backend, and MongoDB...

REM Build and start services
echo 📦 Building and starting services...
docker-compose down
docker-compose build
docker-compose up -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak > nul

REM Test 1: Check if all containers are running
echo.
echo 🔍 Checking container status:
docker-compose ps

REM Test 2: Check MongoDB connectivity
echo.
echo 🗄️ Testing MongoDB connectivity...
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ MongoDB is accessible
) else (
    echo ❌ MongoDB is not accessible
    echo 📋 MongoDB logs:
    docker-compose logs mongo
)

REM Test 3: Check backend connectivity
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

REM Test 4: Check frontend connectivity
echo.
echo 🌐 Testing frontend connectivity...
echo Testing Frontend Root endpoint...
curl -s http://localhost:3000/
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend Root endpoint PASS
) else (
    echo ❌ Frontend Root endpoint FAIL
)

echo Testing Frontend Health check...
curl -s http://localhost:3000/health
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend Health check PASS
) else (
    echo ❌ Frontend Health check FAIL
)

REM Test 5: Test frontend to backend proxy
echo.
echo 🔗 Testing frontend to backend proxy...
echo Testing Frontend API proxy to backend...
curl -s http://localhost:3000/api/health
if !ERRORLEVEL! EQU 0 (
    echo ✅ Frontend API proxy PASS
) else (
    echo ❌ Frontend API proxy FAIL
)

REM Test 6: Test login API through frontend proxy
echo.
echo 🔐 Testing login API through frontend proxy...
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"admin123\"}"
if !ERRORLEVEL! EQU 0 (
    echo ✅ Login API proxy PASS
) else (
    echo ❌ Login API proxy FAIL
)

echo.
echo 🎉 Full deployment test completed!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
echo.
echo 💡 If you see any failures, check the logs with:
echo    docker-compose logs [service-name]
pause
