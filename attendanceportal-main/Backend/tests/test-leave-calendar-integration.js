const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testLeaveCalendarIntegration() {
  try {
    console.log('🔍 Testing Leave Calendar Integration...\n');

    // Step 1: Get all leave requests
    console.log('1️⃣ Fetching all leave requests...');
    const leaveResponse = await fetch(`${API_BASE}/leave/admin`);
    const leaveRequests = await leaveResponse.json();
    console.log(`✅ Found ${leaveRequests.length} leave requests`);
    
    if (leaveRequests.length === 0) {
      console.log('❌ No leave requests found. Please create some leave requests first.');
      return;
    }

    // Step 2: Find an approved leave request
    const approvedRequest = leaveRequests.find(req => req.status === 'Approved');
    if (!approvedRequest) {
      console.log('❌ No approved leave requests found. Please approve a leave request first.');
      return;
    }

    console.log(`\n2️⃣ Found approved leave request:`);
    console.log(`   Employee: ${approvedRequest.employeeName} (${approvedRequest.employeeId})`);
    console.log(`   Status: ${approvedRequest.status}`);
    console.log(`   Leave Type: ${approvedRequest.leaveType}`);
    console.log(`   Start Date: ${approvedRequest.startDate}`);
    console.log(`   End Date: ${approvedRequest.endDate}`);

    // Step 3: Get employee details to find their ID
    console.log('\n3️⃣ Getting employee details...');
    const employeeResponse = await fetch(`${API_BASE}/employee/admin/comprehensive`);
    const employees = await employeeResponse.json();
    const employee = employees.find(emp => emp.employeeId === approvedRequest.employeeId);
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log(`✅ Found employee: ${employee.name} (ID: ${employee._id})`);

    // Step 4: Test attendance details for the month of the leave request
    console.log('\n4️⃣ Testing attendance details for leave month...');
    const startDate = new Date(approvedRequest.startDate);
    const month = startDate.getMonth() + 1; // getMonth() returns 0-11
    const year = startDate.getFullYear();
    
    console.log(`   Testing month: ${month}, year: ${year}`);
    
    const attendanceResponse = await fetch(`${API_BASE}/employee/${employee._id}/attendance-details?month=${month}&year=${year}`);
    
    if (!attendanceResponse.ok) {
      const errorText = await attendanceResponse.text();
      console.log(`❌ Attendance details request failed: ${attendanceResponse.status}`);
      console.log(`   Error: ${errorText}`);
      return;
    }

    const attendanceData = await attendanceResponse.json();
    console.log('✅ Attendance details retrieved successfully');
    console.log(`   Calendar data length: ${attendanceData.calendarData?.length || 0}`);
    console.log(`   Month stats:`, attendanceData.monthStats);

    // Step 5: Check if leave days are properly marked in calendar
    console.log('\n5️⃣ Checking leave days in calendar...');
    const leaveDays = attendanceData.calendarData.filter(day => day.isLeave);
    console.log(`   Found ${leaveDays.length} leave days in calendar`);
    
    if (leaveDays.length > 0) {
      leaveDays.forEach((day, index) => {
        console.log(`   Day ${index + 1}: ${day.day} - ${day.leaveType} (${day.status})`);
      });
    } else {
      console.log('❌ No leave days found in calendar data');
      
      // Debug: Show all days with their status
      console.log('\n🔍 Debug: All calendar days:');
      attendanceData.calendarData.forEach((day, index) => {
        if (day.day && day.status !== 'empty') {
          console.log(`   Day ${day.day}: ${day.status} (isLeave: ${day.isLeave})`);
        }
      });
    }

    // Step 6: Verify month statistics include leave days
    console.log('\n6️⃣ Verifying month statistics...');
    const expectedLeaveDays = attendanceData.calendarData.filter(day => day.isLeave).length;
    const actualLeaveDays = attendanceData.monthStats.leave;
    
    console.log(`   Expected leave days: ${expectedLeaveDays}`);
    console.log(`   Actual leave days in stats: ${actualLeaveDays}`);
    
    if (expectedLeaveDays === actualLeaveDays) {
      console.log('✅ Leave days count matches in statistics');
    } else {
      console.log('❌ Leave days count mismatch in statistics');
    }

    console.log('\n🎉 Leave calendar integration test completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testLeaveCalendarIntegration();
