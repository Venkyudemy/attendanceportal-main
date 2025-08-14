@echo off
echo ========================================
echo    Backend Connection Fix Script
echo ========================================
echo.

echo [1/4] Checking if backend is running...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 5000
) else (
    echo ❌ Backend is not running on port 5000
)

echo.
echo [2/4] Checking if frontend is running...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on port 3000
) else (
    echo ❌ Frontend is not running on port 3000
)

echo.
echo [3/4] Testing backend health endpoint...
curl -s http://localhost:5000/api/health
if %errorlevel% equ 0 (
    echo ✅ Backend health check successful
) else (
    echo ❌ Backend health check failed
)

echo.
echo [4/4] Testing login endpoint...
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"admin123\"}"
if %errorlevel% equ 0 (
    echo ✅ Login endpoint test successful
) else (
    echo ❌ Login endpoint test failed
)

echo.
echo ========================================
echo    Troubleshooting Steps:
echo ========================================
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Try incognito/private browsing mode
echo 3. Check browser console for errors
echo 4. Ensure both services are running
echo.
echo Test credentials:
echo Admin: admin@company.com / admin123
echo Employee: venkatesh111@gmail.com / password123
echo.
pause
