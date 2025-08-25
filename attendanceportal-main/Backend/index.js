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
const bcrypt = require('bcryptjs');

// CORS configuration - More flexible for production
const corsOptions = {
  origin: true, // Allow all origins temporarily for debugging
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

// Admin initialization endpoint (for manual triggering)
app.post('/api/admin/init', async (req, res) => {
  try {
    const result = await initializeAdminUser();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize admin user',
      error: error.message
    });
  }
});

// Check admin status endpoint
app.get('/api/admin/status', async (req, res) => {
  try {
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    if (adminUser) {
      res.json({
        success: true,
        exists: true,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'Admin user not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check admin status',
      error: error.message
    });
  }
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

// Smart Admin User Initialization - Only creates admin if it doesn't exist
const initializeAdminUser = async () => {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists, skipping creation');
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      return { success: true, message: 'Admin user already exists' };
    }
    
    console.log('👤 Admin user not found, creating new admin...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create admin user with complete structure
    const adminUser = new Employee({
      name: 'Admin User',
      email: 'admin@techcorp.com',
      password: hashedPassword,
      role: 'admin',
      position: 'System Administrator',
      department: 'Engineering',
      employeeId: 'ADMIN001',
      phone: '+91-9876543210',
      address: '123 Admin Street, Tech City',
      joinDate: new Date().toISOString().split('T')[0],
      domain: 'IT',
      status: 'Active',
      manager: 'Self',
      salary: '75000',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+91-9876543211',
        email: 'emergency@example.com'
      },
      leaveBalance: {
        annual: { total: 20, remaining: 20, used: 0 },
        sick: { total: 12, remaining: 12, used: 0 },
        personal: { total: 12, remaining: 12, used: 0 }
      },
      attendance: {
        today: {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false,
          hours: 0,
          date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
          timestamp: null
        },
        records: [],
        weeklySummaries: [],
        monthlySummaries: []
      }
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@techcorp.com');
    console.log('🔐 Password: password123');
    console.log('🎯 Role: admin');
    console.log('🚀 Ready for login!');
    
    return { success: true, message: 'Admin user created successfully' };
    
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
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
.then(async () => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  
  // Initialize admin user if it doesn't exist
  console.log('🔍 Initializing admin user...');
  await initializeAdminUser();
  
  console.log('🚀 Starting HTTP server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log('✅ MongoDB connection established');
    console.log('✅ Admin user initialized');
    console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
    console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
    console.log('✅ Leave routes: /api/leave');
    console.log('✅ Health check: /api/health');
    console.log('✅ Admin init: POST /api/admin/init');
    console.log('✅ Admin status: GET /api/admin/status');
    
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
    .then(async () => {
      console.log('✅ Connected to local MongoDB successfully');
      
      // Initialize admin user if it doesn't exist
      console.log('🔍 Initializing admin user...');
      await initializeAdminUser();
      
      console.log('🚀 Starting HTTP server...');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
        console.log('✅ Local MongoDB connection established');
        console.log('✅ Admin user initialized');
        console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
        console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
        console.log('✅ Leave routes: /api/leave');
        console.log('✅ Health check: /api/health');
        console.log('✅ Admin init: POST /api/admin/init');
        console.log('✅ Admin status: GET /api/admin/status');
        
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