const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const LeaveRequest = require('../models/LeaveRequest');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/attendanceportal?authSource=admin';

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Create default settings if they don't exist
    console.log('⚙️  Initializing default settings...');
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        companyName: 'TechCorp Solutions',
        workingHoursStart: '09:00 AM',
        workingHoursEnd: '05:00 PM',
        lateThreshold: 15,
        overtimeThreshold: 8,
        leaveTypes: [
          { name: 'Annual Leave', days: 20, color: '#28a745' },
          { name: 'Sick Leave', days: 10, color: '#dc3545' },
          { name: 'Personal Leave', days: 5, color: '#ffc107' },
          { name: 'Maternity Leave', days: 90, color: '#6f42c1' }
        ],
        companyHolidays: [
          { name: 'New Year\'s Day', date: '2024-01-01', type: 'public', description: 'New Year Celebration' },
          { name: 'Republic Day', date: '2024-01-26', type: 'public', description: 'Indian Republic Day' },
          { name: 'Independence Day', date: '2024-08-15', type: 'public', description: 'Indian Independence Day' }
        ],
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        theme: 'light'
      });
      await settings.save();
      console.log('✅ Default settings created');
    } else {
      console.log('✅ Settings already exist');
    }
    
    // Create test admin user if it doesn't exist
    console.log('👤 Checking for admin user...');
    let adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    if (!adminUser) {
      adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: 'password123', // In production, this should be hashed
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        employeeId: 'ADMIN001',
        phone: '+91-9876543210',
        address: '123 Admin Street, Tech City',
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
        }
      });
      await adminUser.save();
      console.log('✅ Admin user created (admin@techcorp.com / password123)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create test employee if it doesn't exist
    console.log('👤 Checking for test employee...');
    let testEmployee = await Employee.findOne({ email: 'employee@techcorp.com' });
    if (!testEmployee) {
      testEmployee = new Employee({
        name: 'Test Employee',
        email: 'employee@techcorp.com',
        password: 'employee123', // In production, this should be hashed
        role: 'employee',
        position: 'Software Developer',
        department: 'Engineering',
        employeeId: 'EMP001',
        phone: '+91-9876543212',
        address: '456 Employee Street, Tech City',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
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
        }
      });
      await testEmployee.save();
      console.log('✅ Test employee created (employee@techcorp.com / employee123)');
    } else {
      console.log('✅ Test employee already exists');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('👑 Admin: admin@techcorp.com / password123');
    console.log('👤 Employee: employee@techcorp.com / employee123');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the initialization
initializeDatabase();
