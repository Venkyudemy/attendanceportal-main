@echo off
REM Simple Docker Test Script for Leave Calendar Integration
echo 🧪 Testing Docker Setup for Leave Calendar Integration...
echo ======================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Build and start services
echo 🚀 Building and starting services...
cd attendanceportal-main
docker-compose down
docker-compose up -d --build

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Test backend
echo 🧪 Testing backend...
timeout /t 10 /nobreak >nul
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is working
) else (
    echo ❌ Backend is not responding
    echo 📋 Backend logs:
    docker-compose logs backend
    pause
    exit /b 1
)

REM Test frontend
echo 🧪 Testing frontend...
timeout /t 5 /nobreak >nul
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is working
) else (
    echo ❌ Frontend is not responding
    echo 📋 Frontend logs:
    docker-compose logs frontend
    pause
    exit /b 1
)

REM Create test data
echo 📝 Creating test data...
docker exec attendanceportal-main-backend-1 node /app/scripts/create-test-leave.js

if %errorlevel% equ 0 (
    echo ✅ Test data created successfully
) else (
    echo ❌ Failed to create test data
    pause
    exit /b 1
)

REM Test leave calendar integration
echo 🔍 Testing leave calendar integration...
curl -s http://localhost:5000/api/leave/admin > temp_leave_response.json

findstr "employeeName" temp_leave_response.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Leave requests endpoint is working
    
    REM Get employee ID and test attendance details
    findstr "employeeId" temp_leave_response.json > temp_employee_id.txt
    for /f "tokens=2 delims=:," %%a in (temp_employee_id.txt) do (
        set EMPLOYEE_ID=%%a
        goto :found_id
    )
    :found_id
    set EMPLOYEE_ID=%EMPLOYEE_ID:"=%
    set EMPLOYEE_ID=%EMPLOYEE_ID: =%
    
    if not "%EMPLOYEE_ID%"=="" (
        echo ℹ️  Testing with employee ID: %EMPLOYEE_ID%
        
        curl -s "http://localhost:5000/api/employee/%EMPLOYEE_ID%/attendance-details?month=8&year=2025" > temp_attendance_response.json
        
        findstr "calendarData" temp_attendance_response.json >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Attendance details endpoint is working
            
            REM Check for leave days
            findstr "isLeave" temp_attendance_response.json | find /c /v "" > temp_leave_days.txt
            set /p LEAVE_DAYS=<temp_leave_days.txt
            if %LEAVE_DAYS% gtr 0 (
                echo ✅ Found %LEAVE_DAYS% leave days in calendar data
                echo 🎉 Leave calendar integration is working correctly!
            ) else (
                echo ⚠️  No leave days found in calendar data
            )
        ) else (
            echo ❌ Attendance details endpoint is not working
        )
    ) else (
        echo ⚠️  Could not get employee ID from leave requests
    )
) else (
    echo ❌ Leave requests endpoint is not working
)

echo.
echo 🎯 Test Summary:
echo    ✅ Docker services are running
echo    ✅ Backend API is responding
echo    ✅ Frontend is accessible
echo    ✅ Test data created
echo    ✅ Leave calendar integration tested
echo.
echo 🚀 You can now access:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - MongoDB: localhost:27017
echo.
echo 💡 To view logs:
echo    docker-compose logs -f [service-name]
echo.
echo 🧹 To stop services:
echo    docker-compose down

REM Clean up temporary files
del temp_*.json temp_*.txt >nul 2>&1

echo.
echo 🧹 Temporary files cleaned up
pause
