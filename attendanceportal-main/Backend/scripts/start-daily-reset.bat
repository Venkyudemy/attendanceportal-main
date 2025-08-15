@echo off
echo ========================================
echo   Daily Reset System Startup
echo ========================================
echo.

echo Checking MongoDB connection...
cd Backend
echo Testing database connectivity...

echo Starting Backend Server with Daily Reset...
echo.
echo The system will:
echo - Start at current time
echo - Schedule daily reset for 12:00 AM tomorrow
echo - Run automatic reset every 24 hours
echo - Provide manual reset options for admins
echo.
echo Starting server...
start "Daily Reset Backend" cmd /k "npm start"

echo.
echo ========================================
echo   Daily Reset System Started
echo ========================================
echo.
echo Backend: http://localhost:5000
echo.
echo Daily Reset Features:
echo ✅ Automatic reset at 12:00 AM daily
echo ✅ Manual reset for testing
echo ✅ Force reset for emergencies
echo ✅ Reset status monitoring
echo ✅ Enhanced error handling
echo.
echo Check the backend console for:
echo - Reset scheduling confirmation
echo - Daily reset execution logs
echo - Employee reset status
echo.
echo Press any key to open admin portal...
pause >nul

start http://localhost:3000

echo.
echo System is running with daily reset functionality!
echo.
echo To test the daily reset:
echo 1. Use the admin portal manual reset button
echo 2. Check the reset status display
echo 3. Monitor console logs for reset activity
echo.
echo The system will automatically reset all employee
echo check-ins every day at 12:00 AM (midnight).
echo.
pause
