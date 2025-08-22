const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB for database initialization...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout for Docker environment
      socketTimeoutMS: 45000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Create admin user
    await createAdminUser();
    
    // Create sample employee user
    await createSampleEmployee();
    
    console.log('✅ Database initialization completed successfully');
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('🔍 Error details:', error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    console.log('👤 Checking for admin user...');
    
    // Check if admin user already exists
    let adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (adminUser) {
      console.log('✅ Admin user already exists, updating password...');
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('password123', 12);
      adminUser.password = hashedPassword;
      adminUser.role = 'admin'; // Ensure role is set correctly
      await adminUser.save();
      console.log('✅ Admin password updated successfully');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create admin user with complete structure
      adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        employeeId: 'ADMIN001',
        phone: '+91-9876543210',
        address: '123 Admin Street, Tech City',
        joinDate: new Date(),
        status: 'Active',
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
          history: []
        },
        leaveBalance: {
          casual: 12,
          sick: 12,
          earned: 15,
          maternity: 180,
          paternity: 15,
          unpaid: 30
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }
    
    console.log('🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@techcorp.com');
    console.log('🔐 Password: password123');
    console.log('🎯 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function createSampleEmployee() {
  try {
    console.log('👤 Checking for sample employee...');
    
    // Check if sample employee already exists
    let employee = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    
    if (employee) {
      console.log('✅ Sample employee already exists');
    } else {
      console.log('👤 Creating sample employee...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('venkatesh', 12);
      
      // Create sample employee
      employee = new Employee({
        name: 'Venkatesh',
        email: 'venkatesh@gmail.com',
        password: hashedPassword,
        role: 'employee',
        position: 'Software Developer',
        department: 'Engineering',
        employeeId: 'EMP001',
        phone: '+91-9876543212',
        address: '456 Employee Street, Tech City',
        joinDate: new Date(),
        status: 'Active',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543213',
          email: 'emergency2@example.com'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false
          },
          history: []
        },
        leaveBalance: {
          casual: 12,
          sick: 12,
          earned: 15,
          maternity: 180,
          paternity: 15,
          unpaid: 30
        }
      });
      
      await employee.save();
      console.log('✅ Sample employee created successfully');
      console.log('🔑 Employee Login Credentials:');
      console.log('📧 Email: venkatesh@gmail.com');
      console.log('🔐 Password: venkatesh');
      console.log('🎯 Role: employee');
    }
    
  } catch (error) {
    console.error('❌ Error creating sample employee:', error.message);
    throw error;
  }
}

// Run initialization if this script is called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, createAdminUser, createSampleEmployee };
