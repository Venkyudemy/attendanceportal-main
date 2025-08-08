@echo off
echo Starting Attendance Portal...
echo.

echo Starting Backend Server...
cd Backend
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo Starting Frontend Server...
cd Frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo Please wait for both servers to fully start before accessing the application.
pause 