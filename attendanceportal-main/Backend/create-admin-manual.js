const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// Manual admin user creation script
// Run this if automatic creation fails: node create-admin-manual.js

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function createAdminManually() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if admin user already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎯 Role:', existingAdmin.role);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: Admin@123');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password for 'Admin@123'
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      // Create admin user
      const adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        position: 'System Administrator',
        department: 'HR', // Valid enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
        employeeId: 'ADMIN001',
        phone: '+91-9876543210',
        address: '123 Admin Street, Tech City',
        joinDate: new Date().toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        }), // Format: MM/DD/YYYY
        status: 'Active', // Valid enum: ['Active', 'Inactive', 'On Leave']
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543211',
          email: 'emergency@example.com'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false
          },
          records: [],
          weeklySummaries: [],
          monthlySummaries: []
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('🆔 User ID:', adminUser._id);
    }
    
    // Check total users
    const totalUsers = await Employee.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // List all users
    const allUsers = await Employee.find({}, 'email name role employeeId');
    console.log('👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name} - ${user.role}) [${user.employeeId}]`);
    });
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@techcorp.com');
    console.log('🔐 Password: Admin@123');
    console.log('🎯 Role: admin');
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminManually();
