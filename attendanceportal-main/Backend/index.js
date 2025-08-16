const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const employeeRoutes = require('./routes/employee');
const healthRoutes = require('./routes/health');
const settingsRoutes = require('./routes/settings');
const leaveRequestsRoutes = require('./routes/leaveRequests');

// Import Employee model for daily reset
const Employee = require('./models/Employee');

// CORS configuration - More flexible for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production
    : ['http://localhost:3000', 'http://localhost:80', 'http://localhost', 'http://127.0.0.1:3000', 'http://127.0.0.1:80', 'http://127.0.0.1'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/leave-requests', leaveRequestsRoutes);
app.use('/api', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Portal Backend is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Daily Reset Function - Runs at 12 AM every day
const scheduleDailyReset = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to 12:00:00 AM
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  console.log(`🕛 Daily reset scheduled for ${tomorrow.toLocaleString()}`);
  console.log(`⏰ Time until reset: ${Math.round(timeUntilMidnight / (1000 * 60 * 60))} hours`);
  
  // Schedule the first reset
  setTimeout(() => {
    console.log('🔄 Executing scheduled daily reset...');
    performDailyReset();
    // Then schedule it to run every 24 hours
    setInterval(performDailyReset, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
  // Also check if we need to reset immediately (if it's a new day)
  const today = now.toLocaleDateString('en-CA');
  const lastResetDate = process.env.LAST_RESET_DATE || 'unknown';
  
  if (today !== lastResetDate) {
    console.log(`📅 New day detected (${today}), performing immediate reset...`);
    // Perform reset immediately for new day
    setTimeout(() => {
      performDailyReset();
    }, 2000); // Wait 2 seconds for server to fully start
  }
  
  // Additional safety check - run every hour to ensure reset happens
  setInterval(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentDate = currentTime.toLocaleDateString('en-CA');
    
    // If it's midnight (12 AM) and we haven't reset today
    if (currentHour === 0 && currentDate !== process.env.LAST_RESET_DATE) {
      console.log('🕐 Hourly check: Midnight detected, performing reset...');
      performDailyReset();
    }
  }, 60 * 60 * 1000); // Check every hour
};

// Function to perform daily reset
const performDailyReset = async () => {
  try {
    console.log('🔄 Starting daily attendance reset...');
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Check if we already reset today
    if (process.env.LAST_RESET_DATE === today) {
      console.log(`✅ Already reset today (${today}), skipping...`);
      return;
    }
    
    // Get all employees
    const employees = await Employee.find({});
    let resetCount = 0;
    
    console.log(`📊 Found ${employees.length} employees to reset...`);
    
    for (const employee of employees) {
      try {
        // Reset today's attendance status
        employee.attendance.today = {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        };
        
        // Save the updated employee
        await employee.save();
        resetCount++;
        
        console.log(`✅ Reset attendance for employee: ${employee.name}`);
      } catch (empError) {
        console.error(`❌ Failed to reset employee ${employee.name}:`, empError.message);
      }
    }
    
    // Update environment variable to track last reset
    process.env.LAST_RESET_DATE = today;
    
    console.log(`🎉 Daily reset completed! ${resetCount}/${employees.length} employees reset at ${new Date().toLocaleString()}`);
    
    // Log the reset in a more visible way
    console.log('='.repeat(60));
    console.log(`🕛 DAILY ATTENDANCE RESET COMPLETED AT ${new Date().toLocaleString()}`);
    console.log(`📊 Total employees reset: ${resetCount}`);
    console.log(`📅 Date: ${today}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during daily reset:', error);
    console.error('Error stack:', error.stack);
  }
};

// Function to force reset (for testing and emergency use)
const forceDailyReset = async () => {
  try {
    console.log('🚨 FORCE RESET REQUESTED...');
    // Clear the last reset date to force a reset
    process.env.LAST_RESET_DATE = 'force';
    await performDailyReset();
    return { success: true, message: 'Force reset completed' };
  } catch (error) {
    console.error('❌ Force reset failed:', error);
    return { success: false, message: error.message };
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000 // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  
  console.log('🚀 Starting HTTP server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log('✅ MongoDB connection established');
    console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
    console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
    console.log('✅ Leave routes: /api/leave');
    console.log('✅ Health check: /api/health');
    
    // Schedule daily reset after server starts
    scheduleDailyReset();
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Connection details:', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.name
  });
  
  // Try alternative connection for local development
  if (!process.env.MONGO_URL) {
    console.log('🔄 Trying alternative local connection...');
    const localMongoURI = 'mongodb://localhost:27017/attendanceportal';
    
    mongoose.connect(localMongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      console.log('✅ Connected to local MongoDB successfully');
      console.log('🚀 Starting HTTP server...');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
        console.log('✅ Local MongoDB connection established');
        console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
        console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
        console.log('✅ Leave routes: /api/leave');
        console.log('✅ Health check: /api/health');
        
        // Schedule daily reset after server starts
        scheduleDailyReset();
      });
    })
    .catch((localErr) => {
      console.error('❌ Local MongoDB connection also failed:', localErr.message);
      console.log('🚀 Starting server without database connection...');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
        console.log('⚠️  Using mock data - MongoDB connection failed');
        console.log('💡 Please ensure MongoDB is running:');
        console.log('   - Docker: docker-compose up mongodb');
        console.log('   - Local: mongod --dbpath /path/to/data');
      });
    });
  } else {
    console.log('🚀 Starting server without database connection...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log('⚠️  Using mock data - MongoDB connection failed');
      console.log('💡 Please check your MONGO_URL environment variable');
    });
  }
});