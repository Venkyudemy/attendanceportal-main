@echo off
echo 🔧 Fixing Leave Balance Structure for All Employees
echo ================================================

cd Backend

echo 📋 Running leave balance structure fix...
node scripts/fix-leave-balance.js

echo.
echo ✅ Leave balance fix completed!
echo 📊 Check the output above for details
echo.
pause
