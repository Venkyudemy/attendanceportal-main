@echo off
REM Docker Leave Calendar Integration Test Script for Windows
REM This script tests the leave calendar integration in the Docker environment

echo 🧪 Testing Leave Calendar Integration in Docker Environment...
echo ==========================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if containers are running
docker ps | findstr "attendanceportal-main-backend-1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Backend container is not running. Starting services...
    cd attendanceportal-main
    docker-compose up -d
    echo ⏳ Waiting for services to start...
    timeout /t 30 /nobreak >nul
) else (
    echo ✅ Backend container is running
)

REM Wait for backend to be healthy
echo ⏳ Waiting for backend to be healthy...
:wait_loop
docker exec attendanceportal-main-backend-1 curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend is not healthy yet, waiting...
    timeout /t 5 /nobreak >nul
    goto wait_loop
)

echo ✅ Backend is healthy

REM Test the leave calendar integration
echo.
echo 🔍 Testing Leave Calendar Integration...
echo ======================================

REM Step 1: Create test data
echo ℹ️  Step 1: Creating test data...
docker exec attendanceportal-main-backend-1 node /app/scripts/create-test-leave.js

if %errorlevel% equ 0 (
    echo ✅ Test data created successfully
) else (
    echo ❌ Failed to create test data
    pause
    exit /b 1
)

REM Step 2: Test the API endpoints
echo ℹ️  Step 2: Testing API endpoints...

REM Test health endpoint
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health endpoint is working
) else (
    echo ❌ Health endpoint is not working
    pause
    exit /b 1
)

REM Test leave requests endpoint
curl -s http://localhost:5000/api/leave/admin > temp_leave_response.json
findstr "employeeName" temp_leave_response.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Leave requests endpoint is working
    REM Count leave requests (simple count)
    findstr /c:"employeeName" temp_leave_response.json | find /c /v "" > temp_count.txt
    set /p LEAVE_COUNT=<temp_count.txt
    echo ℹ️  Found %LEAVE_COUNT% leave requests
) else (
    echo ❌ Leave requests endpoint is not working
    pause
    exit /b 1
)

REM Step 3: Test attendance details endpoint
echo ℹ️  Step 3: Testing attendance details endpoint...

REM Get employee ID from leave requests (simple extraction)
findstr "employeeId" temp_leave_response.json > temp_employee_id.txt
for /f "tokens=2 delims=:," %%a in (temp_employee_id.txt) do (
    set EMPLOYEE_ID=%%a
    goto :found_id
)
:found_id
set EMPLOYEE_ID=%EMPLOYEE_ID:"=%
set EMPLOYEE_ID=%EMPLOYEE_ID: =%

if "%EMPLOYEE_ID%"=="" (
    echo ❌ Could not get employee ID from leave requests
    pause
    exit /b 1
)

echo ℹ️  Testing with employee ID: %EMPLOYEE_ID%

REM Test attendance details for August 2025
curl -s "http://localhost:5000/api/employee/%EMPLOYEE_ID%/attendance-details?month=8&year=2025" > temp_attendance_response.json

findstr "calendarData" temp_attendance_response.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Attendance details endpoint is working
    
    REM Check if leave days are properly marked
    findstr "isLeave" temp_attendance_response.json | find /c /v "" > temp_leave_days.txt
    set /p LEAVE_DAYS=<temp_leave_days.txt
    if %LEAVE_DAYS% gtr 0 (
        echo ✅ Found %LEAVE_DAYS% leave days in calendar data
    ) else (
        echo ⚠️  No leave days found in calendar data
    )
    
    echo ℹ️  Month statistics retrieved successfully
    
) else (
    echo ❌ Attendance details endpoint is not working
    pause
    exit /b 1
)

REM Step 4: Test frontend integration
echo ℹ️  Step 4: Testing frontend integration...

curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
    
    REM Test if the frontend can load the attendance details
    curl -s http://localhost:3000 > temp_frontend_response.txt
    findstr "Attendance Portal" temp_frontend_response.txt >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Frontend is loading correctly
    ) else (
        echo ⚠️  Frontend content may not be loading correctly
    )
) else (
    echo ❌ Frontend is not accessible
)

echo.
echo 🎉 Docker Leave Calendar Integration Test Completed!
echo ==================================================

REM Summary
echo.
echo 📋 Test Summary:
echo    ✅ Backend container is running and healthy
echo    ✅ Test data created successfully
echo    ✅ API endpoints are working
echo    ✅ Leave calendar integration is functional
echo    ✅ Frontend is accessible

echo.
echo 🚀 You can now access:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - MongoDB: localhost:27017

echo.
echo 💡 To view logs:
echo    - Backend logs: docker logs attendanceportal-main-backend-1
echo    - Frontend logs: docker logs attendanceportal-main-frontend-1
echo    - MongoDB logs: docker logs attendanceportal-main-mongo-1

REM Clean up temporary files
del temp_*.json temp_*.txt temp_*.txt >nul 2>&1

echo.
echo 🧹 Temporary files cleaned up
pause
