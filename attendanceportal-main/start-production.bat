@echo off
echo ========================================
echo   STARTING ATTENDANCE PORTAL (PRODUCTION)
echo ========================================
echo.

echo Setting production environment...
set NODE_ENV=production
set PORT=5000
echo ✅ Environment set to production
echo.

echo Step 1: Killing all existing processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ All processes cleared
echo.

echo Step 2: Starting optimized Backend Server...
cd /d "%~dp0Backend"
start "Production Backend" cmd /k "set NODE_ENV=production && node --max-old-space-size=2048 index.js"
echo ✅ Backend starting with production optimizations...
echo.

echo Step 3: Waiting for backend to initialize...
timeout /t 8 /nobreak >nul
echo.

echo Step 4: Starting optimized Frontend Server...
cd /d "%~dp0Frontend"
start "Production Frontend" cmd /k "set NODE_ENV=production && npm start"
echo ✅ Frontend starting with production optimizations...
echo.

echo ========================================
echo   PRODUCTION SERVICES STARTED!
echo ========================================
echo.
echo 🌐 Backend: http://0.0.0.0:5000 (Public Access)
echo 🌐 Frontend: http://localhost:3000
echo.
echo 📱 Other users can now access your application!
echo 🔐 Login: venkatesh111@gmail.com / password123
echo.
echo ⚡ Performance optimizations enabled:
echo    - Gzip compression
echo    - Database connection pooling
echo    - Rate limiting
echo    - Cache headers
echo    - Memory optimization
echo.
echo Press any key to exit...
pause >nul
