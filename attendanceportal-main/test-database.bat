@echo off
echo 🔍 Testing Database Connection...
echo.

REM Navigate to backend directory
cd Backend

REM Test database connection
echo 🔗 Testing MongoDB connection...
node -e "
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/attendanceportal';

async function testConnection() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('   Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure MongoDB is installed and running');
    console.log('   2. Check if MongoDB service is started');
    console.log('   3. Verify MongoDB is listening on port 27017');
    console.log('   4. Try: net start MongoDB (if using Windows service)');
  }
}

testConnection();
"

echo.
echo 📋 MongoDB Status Check:
netstat -an | findstr :27017
echo.
pause
