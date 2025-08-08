#!/bin/bash

echo "Starting Attendance Portal..."
echo

echo "Starting Backend Server..."
cd Backend
gnome-terminal --title="Backend Server" -- bash -c "npm start; exec bash" &
cd ..

echo
echo "Starting Frontend Server..."
cd Frontend
gnome-terminal --title="Frontend Server" -- bash -c "npm start; exec bash" &
cd ..

echo
echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo
echo "Please wait for both servers to fully start before accessing the application." 