// Enhanced test script for daily reset functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testDailyReset() {
  console.log('🧪 Testing Enhanced Daily Reset Functionality...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
    
    // Test 2: Check current reset status
    console.log('\n2️⃣ Checking current reset status...');
    const statusResponse = await fetch(`${API_BASE}/employee/reset-status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Reset status retrieved:', statusData);
    } else {
      console.log('❌ Failed to get reset status:', statusResponse.status);
    }
    
    // Test 3: Test manual daily reset endpoint
    console.log('\n3️⃣ Testing manual daily reset endpoint...');
    const resetResponse = await fetch(`${API_BASE}/employee/manual-daily-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (resetResponse.ok) {
      const resetResult = await resetResponse.json();
      console.log('✅ Manual reset successful:', resetResult);
    } else {
      console.log('❌ Manual reset failed:', resetResponse.status);
      const errorText = await resetResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 4: Check employee attendance after reset
    console.log('\n4️⃣ Checking employee attendance after reset...');
    const attendanceResponse = await fetch(`${API_BASE}/employee/attendance`);
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json();
      console.log(`✅ Found ${attendanceData.length} employees`);
      
      // Check if all employees have reset attendance
      const resetEmployees = attendanceData.filter(emp => 
        !emp.attendance.checkIn && !emp.attendance.checkOut && emp.attendance.status === 'Absent'
      );
      
      console.log(`📊 Reset status: ${resetEmployees.length}/${attendanceData.length} employees have reset attendance`);
      
      if (resetEmployees.length === attendanceData.length) {
        console.log('🎉 All employees have been reset successfully!');
      } else {
        console.log('⚠️ Some employees may not have been reset');
        
        // Show details of employees that weren't reset
        const notResetEmployees = attendanceData.filter(emp => 
          emp.attendance.checkIn || emp.attendance.checkOut || emp.attendance.status !== 'Absent'
        );
        
        console.log('Employees not reset:', notResetEmployees.map(emp => ({
          name: emp.name,
          checkIn: emp.attendance.checkIn,
          checkOut: emp.attendance.checkOut,
          status: emp.attendance.status
        })));
      }
    } else {
      console.log('❌ Failed to fetch attendance data');
    }
    
    // Test 5: Test force reset endpoint
    console.log('\n5️⃣ Testing force reset endpoint...');
    const forceResetResponse = await fetch(`${API_BASE}/employee/force-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (forceResetResponse.ok) {
      const forceResetResult = await forceResetResponse.json();
      console.log('✅ Force reset successful:', forceResetResult);
    } else {
      console.log('❌ Force reset failed:', forceResetResponse.status);
      const errorText = await forceResetResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 6: Final status check
    console.log('\n6️⃣ Final reset status check...');
    const finalStatusResponse = await fetch(`${API_BASE}/employee/reset-status`);
    if (finalStatusResponse.ok) {
      const finalStatus = await finalStatusResponse.json();
      console.log('✅ Final reset status:', finalStatus);
      
      if (finalStatus.checkedIn === 0 && finalStatus.checkedOut === 0) {
        console.log('🎉 SUCCESS: All employees have been reset!');
      } else {
        console.log('⚠️ Some employees still have attendance data');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
console.log('Starting enhanced daily reset test...');
console.log('Make sure the backend server is running on http://localhost:5000\n');

testDailyReset().then(() => {
  console.log('\n🧪 Test completed!');
  console.log('Check the console output above for results.');
});
