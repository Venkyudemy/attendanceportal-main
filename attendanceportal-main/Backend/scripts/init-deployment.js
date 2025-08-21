const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function waitForMongoDB(maxRetries = 30, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔗 Attempting to connect to MongoDB (attempt ${i + 1}/${maxRetries})...`);
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Successfully connected to MongoDB');
      return true;
    } catch (error) {
      console.log(`❌ Connection attempt ${i + 1} failed: ${error.message}`);
      if (i < maxRetries - 1) {
        console.log(`⏳ Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after maximum retries');
}

async function createAdminUser() {
  try {
    console.log('👤 Checking for admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating password and role...');
      
      // Update password and ensure role is set
      const hashedPassword = await bcrypt.hash('password123', 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      
      // Ensure all required fields are present
      if (!existingAdmin.attendance) {
        existingAdmin.attendance = {
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
        };
      }
      
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('👤 Creating new admin user...');
      
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
    }
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@techcorp.com');
    console.log('🔐 Password: password123');
    console.log('🎯 Role: admin');
    console.log('🚀 Ready for login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function verifyAdminUser() {
  try {
    console.log('🔍 Verifying admin user...');
    
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (!adminUser) {
      throw new Error('Admin user not found after creation');
    }
    
    // Test password
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    if (!isPasswordValid) {
      throw new Error('Admin password verification failed');
    }
    
    if (adminUser.role !== 'admin') {
      throw new Error('Admin role verification failed');
    }
    
    console.log('✅ Admin user verification successful');
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Role: ${adminUser.role}`);
    console.log(`   - Password: Valid`);
    
  } catch (error) {
    console.error('❌ Admin user verification failed:', error.message);
    throw error;
  }
}

async function initializeDeployment() {
  try {
    console.log('🚀 Starting deployment initialization...');
    
    // Wait for MongoDB to be ready
    await waitForMongoDB();
    
    // Create admin user
    await createAdminUser();
    
    // Verify admin user
    await verifyAdminUser();
    
    console.log('\n🎉 Deployment initialization completed successfully!');
    console.log('✅ Admin user is ready for login');
    console.log('✅ Backend can now start');
    
  } catch (error) {
    console.error('❌ Deployment initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the initialization
initializeDeployment();
