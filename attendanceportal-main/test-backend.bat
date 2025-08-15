@echo off
echo 🧪 Testing Backend Server...

REM Wait for backend to be ready
echo ⏳ Waiting for backend to be ready...
for /l %%i in (1,1,30) do (
    curl -f http://localhost:5000/api/health >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Backend is ready!
        goto :test_endpoints
    )
    echo Attempt %%i/30...
    timeout /t 2 /nobreak >nul
)

:test_endpoints
echo.
echo 🔍 Testing Basic Endpoints:

echo Testing Root endpoint...
curl -s http://localhost:5000/
if !ERRORLEVEL! EQU 0 (
    echo ✅ Root endpoint PASS
) else (
    echo ❌ Root endpoint FAIL
)

echo Testing Health check...
curl -s http://localhost:5000/api/health
if !ERRORLEVEL! EQU 0 (
    echo ✅ Health check PASS
) else (
    echo ❌ Health check FAIL
)

echo.
echo 🔐 Testing Authentication Endpoints:
echo Testing Login endpoint...
curl -s -X POST http://localhost:5000/api/auth/login
if !ERRORLEVEL! EQU 0 (
    echo ✅ Login endpoint PASS
) else (
    echo ❌ Login endpoint FAIL
)

echo.
echo 👥 Testing Employee Endpoints:
echo Testing Employee list...
curl -s http://localhost:5000/api/employee
if !ERRORLEVEL! EQU 0 (
    echo ✅ Employee list PASS
) else (
    echo ❌ Employee list FAIL
)

echo.
echo 🎉 Backend testing completed!
echo 🌐 Backend URL: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
pause
