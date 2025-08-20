@echo off
echo ========================================
echo   Fix Database After AWS Deployment
echo ========================================
echo.

echo 🔧 Fixing database issues after deployment...
echo 📋 This will:
echo    - Remove duplicate check-in records
echo    - Remove late records
echo    - Reset today's attendance
echo    - Recalculate summaries
echo.

node Backend/fix-database-after-deployment.js

echo.
echo ✅ Database fixing completed!
echo 📁 Check the console output above for results
echo.
pause
