@echo off
echo 🔧 Fixing Leave Balance Structure V2 - All Employees
echo ===================================================

cd Backend

echo 📋 Running leave balance structure fix (V2)...
node scripts/fix-leave-balance-v2.js

echo.
echo ✅ Leave balance fix V2 completed!
echo 📊 Check the output above for details
echo.
pause
