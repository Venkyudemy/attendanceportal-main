@echo off
echo ========================================
echo 🔧 Fixing Docker Compose Login Issue
echo ========================================
echo.

echo 🛑 Stopping all services...
docker-compose down

echo.
echo 🗑️ Removing MongoDB volume to reset database...
docker volume rm attendanceportal-main_mongo_data

echo.
echo 🚀 Starting services with fresh database...
docker-compose up -d

echo.
echo ⏳ Waiting for MongoDB to initialize (45 seconds)...
echo 💡 This will create the admin user automatically
timeout /t 45 /nobreak >nul

echo.
echo 🔍 Checking if admin user was created...
docker-compose exec mongo mongosh attendanceportal --eval "db.employees.findOne({email: 'admin@techcorp.com'}, {email: 1, name: 1, role: 1})"

echo.
echo 🔍 Checking if sample employee was created...
docker-compose exec mongo mongosh attendanceportal --eval "db.employees.findOne({email: 'venkatesh@gmail.com'}, {email: 1, name: 1, role: 1})"

echo.
echo 📊 Total users in database:
docker-compose exec mongo mongosh attendanceportal --eval "db.employees.countDocuments()"

echo.
echo ========================================
echo ✅ Fix completed! Try logging in now:
echo 👑 Admin: admin@techcorp.com / password123
echo 👤 Employee: venkatesh@gmail.com / venkatesh
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo.
echo 💡 If login still fails, check logs: docker-compose logs -f
echo.
pause
