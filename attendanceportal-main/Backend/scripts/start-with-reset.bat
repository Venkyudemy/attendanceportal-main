@echo off
echo ========================================
echo   Attendance Portal with Daily Reset
echo ========================================
echo.

echo Starting MongoDB (if not running)...
start /B mongod --dbpath "C:\data\db" 2>nul
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
cd Backend
echo Starting server with daily reset functionality...
start "Backend Server" cmd /k "npm start"
timeout /t 5 /nobreak >nul

echo Starting Frontend...
cd ..\Frontend
echo Starting React development server...
start "Frontend Server" cmd /k "npm start"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   System Starting Up...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Daily Reset: Automatically runs at 12:00 AM
echo Manual Reset: Available in Admin Portal
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000

echo.
echo System started successfully!
echo Check the console windows for any errors.
echo.
echo To stop the system, close the console windows.
pause
