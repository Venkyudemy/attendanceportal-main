const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const LeaveRequest = require('./models/LeaveRequest');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testDataPersistence() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if employees exist and have proper data structure
    console.log('\n📊 Test 1: Employee Data Structure Check');
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('❌ No employees found. Please create some employees first.');
      return;
    }

    // Test 2: Check attendance data structure for each employee
    console.log('\n📊 Test 2: Attendance Data Structure Check');
    for (const employee of employees) {
      console.log(`\n👤 Employee: ${employee.name} (${employee.email})`);
      
      // Check attendance structure
      if (!employee.attendance) {
        console.log('❌ No attendance object found');
        continue;
      }

      // Check today's attendance
      if (employee.attendance.today) {
        console.log('  📅 Today\'s attendance:');
        console.log(`    - Check-in: ${employee.attendance.today.checkIn || 'Not set'}`);
        console.log(`    - Check-out: ${employee.attendance.today.checkOut || 'Not set'}`);
        console.log(`    - Status: ${employee.attendance.today.status || 'Not set'}`);
        console.log(`    - Is Late: ${employee.attendance.today.isLate || 'Not set'}`);
        console.log(`    - Hours: ${employee.attendance.today.hours || 'Not set'}`);
        console.log(`    - Date: ${employee.attendance.today.date || 'Not set'}`);
        console.log(`    - Timestamp: ${employee.attendance.today.timestamp || 'Not set'}`);
      } else {
        console.log('❌ No today\'s attendance data found');
      }

      // Check attendance records
      if (employee.attendance.records && Array.isArray(employee.attendance.records)) {
        console.log(`  📋 Attendance records: ${employee.attendance.records.length} records`);
        if (employee.attendance.records.length > 0) {
          const latestRecord = employee.attendance.records[employee.attendance.records.length - 1];
          console.log(`    Latest record: ${latestRecord.date} - ${latestRecord.status} (${latestRecord.checkIn} to ${latestRecord.checkOut})`);
        }
      } else {
        console.log('❌ No attendance records array found');
      }

      // Check weekly summaries
      if (employee.attendance.weeklySummaries && Array.isArray(employee.attendance.weeklySummaries)) {
        console.log(`  📊 Weekly summaries: ${employee.attendance.weeklySummaries.length} summaries`);
      } else {
        console.log('❌ No weekly summaries array found');
      }

      // Check monthly summaries
      if (employee.attendance.monthlySummaries && Array.isArray(employee.attendance.monthlySummaries)) {
        console.log(`  📈 Monthly summaries: ${employee.attendance.monthlySummaries.length} summaries`);
      } else {
        console.log('❌ No monthly summaries array found');
      }
    }

    // Test 3: Check leave requests
    console.log('\n📊 Test 3: Leave Requests Check');
    const leaveRequests = await LeaveRequest.find({});
    console.log(`Found ${leaveRequests.length} leave requests`);

    if (leaveRequests.length > 0) {
      for (const leave of leaveRequests) {
        console.log(`\n📝 Leave Request: ${leave.leaveType} for ${leave.employeeName}`);
        console.log(`  - Status: ${leave.status}`);
        console.log(`  - Dates: ${leave.startDate} to ${leave.endDate}`);
        console.log(`  - Total Days: ${leave.totalDays}`);
        console.log(`  - Employee ID: ${leave.employeeId}`);
        console.log(`  - Created: ${leave.createdAt}`);
      }
    } else {
      console.log('ℹ️ No leave requests found');
    }

    // Test 4: Test data creation and persistence
    console.log('\n📊 Test 4: Data Creation and Persistence Test');
    
    // Find first employee for testing
    const testEmployee = employees[0];
    console.log(`\n🧪 Testing with employee: ${testEmployee.name}`);

    // Test check-in data creation
    const testDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const testTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    // Create test attendance record
    const testRecord = {
      date: testDate,
      checkIn: testTime,
      checkOut: null,
      status: 'Present',
      hours: 0,
      isLate: false,
      timestamp: new Date().toISOString()
    };

    // Add test record to employee
    if (!testEmployee.attendance.records) {
      testEmployee.attendance.records = [];
    }
    
    // Check if record already exists for today
    const existingIndex = testEmployee.attendance.records.findIndex(r => r.date === testDate);
    if (existingIndex >= 0) {
      testEmployee.attendance.records[existingIndex] = testRecord;
      console.log('✅ Updated existing attendance record for today');
    } else {
      testEmployee.attendance.records.push(testRecord);
      console.log('✅ Added new attendance record for today');
    }

    // Update today's attendance
    testEmployee.attendance.today = {
      checkIn: testTime,
      checkOut: null,
      status: 'Present',
      isLate: false,
      date: testDate,
      timestamp: new Date().toISOString()
    };

    // Save the employee
    console.log('💾 Saving employee data...');
    await testEmployee.save();
    console.log('✅ Employee data saved successfully');

    // Verify the data was saved
    const savedEmployee = await Employee.findById(testEmployee._id);
    if (savedEmployee && savedEmployee.attendance.today.checkIn === testTime) {
      console.log('✅ Data verification successful - check-in time confirmed in database');
    } else {
      console.log('❌ Data verification failed - check-in time not found in database');
    }

    // Test 5: Check MongoDB connection and write operations
    console.log('\n📊 Test 5: MongoDB Connection and Write Operations');
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`Database connection state: ${states[connectionState]} (${connectionState})`);

    if (connectionState === 1) {
      console.log('✅ Database is connected and ready for operations');
    } else {
      console.log('❌ Database is not in a ready state');
    }

    // Test 6: Check if data persists after reconnection
    console.log('\n📊 Test 6: Data Persistence After Reconnection');
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Reconnecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const reconnectedEmployee = await Employee.findById(testEmployee._id);
    if (reconnectedEmployee && reconnectedEmployee.attendance.today.checkIn === testTime) {
      console.log('✅ Data persistence verified - check-in time still exists after reconnection');
    } else {
      console.log('❌ Data persistence failed - check-in time lost after reconnection');
    }

    console.log('\n🎉 All data persistence tests completed!');

  } catch (error) {
    console.error('❌ Error during data persistence test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test
testDataPersistence();
