const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_portal';

async function createTestLeaveRequest() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Find or create a test employee
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
          records: []
        }
      });
      await testEmployee.save();
      console.log('✅ Test employee created');
    } else {
      console.log('✅ Test employee found:', testEmployee.name);
    }
    
    // Create an approved leave request for August 2025 (as shown in the images)
    const testLeaveRequest = new LeaveRequest({
      employeeId: testEmployee._id,
      employeeName: testEmployee.name,
      employeeEmail: testEmployee.email,
      leaveType: 'Sick Leave',
      startDate: '2025-08-20',
      endDate: '2025-08-22',
      totalDays: 3,
      reason: 'Test sick leave for calendar integration',
      status: 'Approved',
      adminNotes: 'Approved for testing calendar display'
    });
    
    await testLeaveRequest.save();
    console.log('✅ Test approved leave request created successfully!');
    console.log('   Leave Type:', testLeaveRequest.leaveType);
    console.log('   Start Date:', testLeaveRequest.startDate);
    console.log('   End Date:', testLeaveRequest.endDate);
    console.log('   Status:', testLeaveRequest.status);
    console.log('   Employee ID:', testLeaveRequest.employeeId);
    
    // Create another approved leave request for different dates
    const testLeaveRequest2 = new LeaveRequest({
      employeeId: testEmployee._id,
      employeeName: testEmployee.name,
      employeeEmail: testEmployee.email,
      leaveType: 'Annual Leave',
      startDate: '2025-08-25',
      endDate: '2025-08-27',
      totalDays: 3,
      reason: 'Test annual leave for calendar integration',
      status: 'Approved',
      adminNotes: 'Approved for testing calendar display'
    });
    
    await testLeaveRequest2.save();
    console.log('✅ Second test approved leave request created successfully!');
    console.log('   Leave Type:', testLeaveRequest2.leaveType);
    console.log('   Start Date:', testLeaveRequest2.startDate);
    console.log('   End Date:', testLeaveRequest2.endDate);
    console.log('   Status:', testLeaveRequest2.status);
    
    // Create a personal leave request
    const testLeaveRequest3 = new LeaveRequest({
      employeeId: testEmployee._id,
      employeeName: testEmployee.name,
      employeeEmail: testEmployee.email,
      leaveType: 'Personal Leave',
      startDate: '2025-08-18',
      endDate: '2025-08-18',
      totalDays: 1,
      reason: 'Test personal leave for calendar integration',
      status: 'Approved',
      adminNotes: 'Approved for testing calendar display'
    });
    
    await testLeaveRequest3.save();
    console.log('✅ Third test approved leave request created successfully!');
    console.log('   Leave Type:', testLeaveRequest3.leaveType);
    console.log('   Start Date:', testLeaveRequest3.startDate);
    console.log('   End Date:', testLeaveRequest3.endDate);
    console.log('   Status:', testLeaveRequest3.status);
    
    console.log('\n🎉 All test leave requests created successfully!');
    console.log('📋 Summary:');
    console.log(`   - Employee: ${testEmployee.name} (${testEmployee.employeeId})`);
    console.log(`   - Employee MongoDB ID: ${testEmployee._id}`);
    console.log(`   - Total approved leave requests: 3`);
    
  } catch (error) {
    console.error('❌ Error creating test leave request:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createTestLeaveRequest();
