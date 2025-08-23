@echo off
echo ========================================
echo 🚀 Attendance Portal Deployment Verification
echo ========================================
echo.

echo 📋 Checking application structure...
if not exist "Backend" (
    echo ❌ Backend directory not found
    goto :error
)
if not exist "Frontend" (
    echo ❌ Frontend directory not found
    goto :error
)
echo ✅ Application structure verified

echo.
echo 📁 Checking Backend files...
if not exist "Backend\index.js" (
    echo ❌ Backend index.js not found
    goto :error
)
if not exist "Backend\startup-admin-creation.js" (
    echo ❌ startup-admin-creation.js not found
    goto :error
)
if not exist "Backend\create-admin-manual.js" (
    echo ❌ create-admin-manual.js not found
    goto :error
)
if not exist "Backend\models\Employee.js" (
    echo ❌ Employee model not found
    goto :error
)
if not exist "Backend\package.json" (
    echo ❌ Backend package.json not found
    goto :error
)
echo ✅ Backend files verified

echo.
echo 📁 Checking Frontend files...
if not exist "Frontend\package.json" (
    echo ❌ Frontend package.json not found
    goto :error
)
if not exist "Frontend\src\services\api.js" (
    echo ❌ Frontend API service not found
    goto :error
)
echo ✅ Frontend files verified

echo.
echo 📁 Checking Docker configuration...
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found
    goto :error
)
if not exist "Backend\Dockerfile" (
    echo ❌ Backend Dockerfile not found
    goto :error
)
if not exist "Frontend\Dockerfile" (
    echo ❌ Frontend Dockerfile not found
    goto :error
)
echo ✅ Docker configuration verified

echo.
echo 📁 Checking documentation...
if not exist "SEPARATED_INSTANCES_ADMIN_FIX.md" (
    echo ❌ Separated instances guide not found
    goto :error
)
if not exist "DOCKER_COMPOSE_ADMIN_FIX.md" (
    echo ❌ Docker Compose guide not found
    goto :error
)
echo ✅ Documentation verified

echo.
echo 🔍 Checking for potential issues...

echo.
echo 📊 Checking Backend dependencies...
cd Backend
if not exist "node_modules" (
    echo ⚠️  Backend node_modules not found - run 'npm install' first
) else (
    echo ✅ Backend dependencies installed
)

echo.
echo 📊 Checking Frontend dependencies...
cd ..\Frontend
if not exist "node_modules" (
    echo ⚠️  Frontend node_modules not found - run 'npm install' first
) else (
    echo ✅ Frontend dependencies installed
)

cd ..

echo.
echo 🧪 Running application test...
if exist "Backend\test-application.js" (
    echo 📝 Application test script found
    echo 💡 Run 'cd Backend && node test-application.js' to test the application
) else (
    echo ❌ Application test script not found
)

echo.
echo 🔑 Default Login Credentials:
echo    Admin: admin@techcorp.com / password123
echo    Employee: venkatesh@gmail.com / venkatesh

echo.
echo 🚀 Deployment Options:
echo    1. Docker Compose: docker-compose up
echo    2. Separated Instances: Follow SEPARATED_INSTANCES_ADMIN_FIX.md
echo    3. Manual Backend: cd Backend && npm start

echo.
echo ✅ Deployment verification completed successfully!
echo.
echo 💡 Next steps:
echo    1. Ensure MongoDB is running
echo    2. Start your backend service
echo    3. Test login with admin credentials
echo    4. Check logs for admin user creation
echo.
goto :end

:error
echo.
echo ❌ Deployment verification failed!
echo Please fix the issues above before proceeding.
echo.
pause
exit /b 1

:end
echo.
echo 🎯 Ready for deployment!
pause
