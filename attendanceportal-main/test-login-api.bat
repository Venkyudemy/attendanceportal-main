@echo off
echo 🔍 Testing Login API...
echo.

echo 🚀 Testing backend login API...
echo.

REM Test admin login
echo 📧 Testing Admin Login (admin@techcorp.com / password123)...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@techcorp.com\",\"password\":\"password123\"}" ^
  --connect-timeout 10

echo.
echo.

REM Test employee login
echo 📧 Testing Employee Login (venkatesh@gmail.com / venkatesh)...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"venkatesh@gmail.com\",\"password\":\"venkatesh\"}" ^
  --connect-timeout 10

echo.
echo.

REM Test with wrong password
echo ❌ Testing Wrong Password (admin@techcorp.com / wrongpassword)...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@techcorp.com\",\"password\":\"wrongpassword\"}" ^
  --connect-timeout 10

echo.
echo.

REM Test backend health
echo 🏥 Testing Backend Health...
curl http://localhost:5000/api/health --connect-timeout 10

echo.
echo.
echo 🔑 Expected Results:
echo    ✅ Admin login should return: {\"token\":\"...\",\"user\":{...}}
echo    ✅ Employee login should return: {\"token\":\"...\",\"user\":{...}}
echo    ❌ Wrong password should return: {\"error\":\"Unauthorized\",\"message\":\"Invalid username and password\"}
echo    ✅ Health check should return: {\"status\":\"ok\"}
echo.
pause
