@echo off
echo ========================================
echo 🔧 CREATING MISSING .ENV FILES
echo ========================================
echo.
echo 💡 This will create the missing configuration files!
echo.

echo 💡 Creating Backend/.env file...
echo MONGO_URL=mongodb+srv://attendanceadmin:YourPassword123!@cluster0.mongodb.net/attendanceportal?retryWrites=true&w=majority > Backend\.env
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> Backend\.env
echo PORT=5000 >> Backend\.env
echo NODE_ENV=production >> Backend\.env
echo CORS_ORIGIN=http://localhost:3000 >> Backend\.env
echo ✅ Backend/.env created!

echo.
echo 💡 Creating Frontend/.env file...
echo REACT_APP_API_URL=http://localhost:5000/api > Frontend\.env
echo ✅ Frontend/.env created!

echo.
echo ========================================
echo 🎯 NEXT STEPS:
echo ========================================
echo.
echo 💡 IMPORTANT: You need to update the MongoDB connection string!
echo.
echo 1️⃣ Go to: https://www.mongodb.com/atlas
echo 2️⃣ Create FREE account and cluster
echo 3️⃣ Get your connection string
echo 4️⃣ Replace the placeholder in Backend/.env
echo.
echo 💡 Or run QUICK_LOGIN_FIX.bat for automatic setup!
echo.
pause
