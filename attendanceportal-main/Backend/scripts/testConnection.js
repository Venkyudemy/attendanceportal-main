const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const LeaveRequest = require('../models/LeaveRequest');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/attendanceportal?authSource=admin';

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📡 URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test creating a simple document
    console.log('\n🧪 Testing document creation...');
    
    // Test Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        companyName: 'Test Company',
        workingHoursStart: '09:00 AM',
        workingHoursEnd: '05:00 PM',
        leaveTypes: [
          { name: 'Annual Leave', days: 20, color: '#28a745' },
          { name: 'Sick Leave', days: 10, color: '#dc3545' }
        ]
      });
      await settings.save();
      console.log('✅ Settings created successfully');
    } else {
      console.log('✅ Settings already exist');
    }
    
    // Test Employee
    let testEmployee = await Employee.findOne({ email: 'test@example.com' });
    if (!testEmployee) {
      testEmployee = new Employee({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'employee',
        position: 'Developer',
        department: 'IT',
        employeeId: 'TEST001',
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
      console.log('✅ Test employee created successfully');
    } else {
      console.log('✅ Test employee already exists');
    }
    
    // Test Leave Request
    let testLeaveRequest = await LeaveRequest.findOne({ employeeEmail: 'test@example.com' });
    if (!testLeaveRequest) {
      testLeaveRequest = new LeaveRequest({
        employeeId: testEmployee._id,
        employeeName: 'Test User',
        employeeEmail: 'test@example.com',
        leaveType: 'Annual Leave',
        startDate: '2024-12-20',
        endDate: '2024-12-22',
        totalDays: 3,
        reason: 'Test leave request',
        status: 'Pending'
      });
      await testLeaveRequest.save();
      console.log('✅ Test leave request created successfully');
    } else {
      console.log('✅ Test leave request already exists');
    }
    
    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Test Data Summary:');
    console.log('- Settings:', await Settings.countDocuments());
    console.log('- Employees:', await Employee.countDocuments());
    console.log('- Leave Requests:', await LeaveRequest.countDocuments());
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testConnection();
