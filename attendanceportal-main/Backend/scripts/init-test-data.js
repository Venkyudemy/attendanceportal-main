const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const LeaveRequest = require('../models/LeaveRequest');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendanceportal';

async function initializeTestData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test admin user
    console.log('👤 Creating test admin user...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminUser = await Employee.findOneAndUpdate(
      { email: 'admin@company.com' },
      {
        name: 'Admin User',
        email: 'admin@company.com',
        password: adminPassword,
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        phone: '1234567890',
        employeeId: 'ADMIN001',
        domain: 'admin',
        joinDate: new Date('2024-01-01'),
        status: 'Active',
        attendance: {
          today: {
            status: 'Present',
            checkIn: '09:00',
            checkOut: '17:45',
            isLate: false,
            totalHours: 8
          },
          thisWeek: {
            present: 5,
            absent: 0,
            late: 0,
            totalHours: 40
          },
          thisMonth: {
            present: 22,
            absent: 0,
            late: 1,
            totalHours: 176
          },
          records: []
        },
        leaveBalance: {
          casual: { total: 10, used: 2, remaining: 8 },
          sick: { total: 15, used: 1, remaining: 14 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Admin user created/updated:', adminUser.email);

    // Create test employee
    console.log('👤 Creating test employee...');
    const employeePassword = await bcrypt.hash('employee123', 10);
    const testEmployee = await Employee.findOneAndUpdate(
      { email: 'employee@company.com' },
      {
        name: 'Test Employee',
        email: 'employee@company.com',
        password: employeePassword,
        role: 'employee',
        department: 'HR',
        position: 'HR Assistant',
        phone: '9876543210',
        employeeId: 'EMP001',
        domain: 'hr',
        joinDate: new Date('2024-02-01'),
        status: 'Active',
        attendance: {
          today: {
            status: 'Present',
            checkIn: '08:55',
            checkOut: '17:05',
            isLate: false,
            totalHours: 8.17
          },
          thisWeek: {
            present: 4,
            absent: 1,
            late: 1,
            totalHours: 32
          },
          thisMonth: {
            present: 18,
            absent: 2,
            late: 3,
            totalHours: 144
          },
          records: []
        },
        leaveBalance: {
          casual: { total: 10, used: 3, remaining: 7 },
          sick: { total: 15, used: 2, remaining: 13 },
          personal: { total: 5, used: 1, remaining: 4 }
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test employee created/updated:', testEmployee.email);

    // Create default settings
    console.log('⚙️ Creating default settings...');
    const defaultSettings = await Settings.findOneAndUpdate(
      {},
      {
        companyName: 'Test Company',
        workingHoursStart: '09:00 AM',
        workingHoursEnd: '05:00 PM',
        lateThreshold: 15,
        overtimeThreshold: 8,
        leaveTypes: [
          {
            name: 'Casual Leave',
            days: 10,
            color: '#007bff'
          },
          {
            name: 'Sick Leave',
            days: 15,
            color: '#28a745'
          },
          {
            name: 'Personal Leave',
            days: 5,
            color: '#ffc107'
          }
        ],
        companyHolidays: [
          {
            name: 'New Year',
            date: '2025-01-01',
            type: 'public',
            description: 'New Year Day'
          },
          {
            name: 'Independence Day',
            date: '2025-08-15',
            type: 'public',
            description: 'Independence Day'
          },
          {
            name: 'Republic Day',
            date: '2025-01-26',
            type: 'public',
            description: 'Republic Day'
          }
        ],
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        theme: 'light'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Default settings created/updated');

    // Create test leave request
    console.log('📝 Creating test leave request...');
    const testLeaveRequest = await LeaveRequest.findOneAndUpdate(
      { employeeId: testEmployee._id },
      {
        employeeId: testEmployee._id,
        employeeName: testEmployee.name,
        employeeEmail: testEmployee.email,
        leaveType: 'Personal Leave',
        startDate: '2025-08-20',
        endDate: '2025-08-22',
        totalDays: 3,
        reason: 'Family function',
        status: 'Pending',
        requestedAt: new Date()
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test leave request created/updated');

    console.log('\n🎉 Test data initialization complete!');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@techcorp.com / [password hidden for security]');
    console.log('   Employee: employee@company.com / employee123');
    console.log('   Venkatesh: venkatesh@gmail.com / venkatesh');
    console.log('📊 Database Status: ✅ Connected');
    console.log('👥 Users Created: ✅ Admin + Employee');
    console.log('⚙️ Settings: ✅ Default configuration');
    console.log('📝 Leave Request: ✅ Test request created');

  } catch (error) {
    console.error('❌ Error initializing test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the initialization
initializeTestData();
