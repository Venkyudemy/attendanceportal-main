@echo off
echo 👤 Adding Employee to Attendance Portal Database...

REM Navigate to backend directory
cd Backend

REM Run the employee creation script
echo 🔗 Connecting to database and creating employee...
node scripts/addEmployee.js

echo.
echo ✅ Employee creation process completed!
echo.
echo 👤 New Employee Credentials:
echo    Email: venkatesh@gmail.com
echo    Password: venkatesh
echo    Role: employee
echo.
echo 🌐 You can now login with these credentials at:
echo    http://10.140.94.16
echo.
pause
