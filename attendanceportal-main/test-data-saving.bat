@echo off
echo ========================================
echo   Test Employee Data Saving
echo ========================================
echo.

echo 📊 Testing data persistence...
node test-data-persistence.js

echo.
echo 📅 Initializing attendance structure...
node initialize-attendance-structure.js

echo.
echo ✅ All tests completed!
echo 📁 Check the console output above for results
echo.
pause
