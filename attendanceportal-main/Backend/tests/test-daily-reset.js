// Test script for daily reset functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testDailyReset() {
  console.log('🧪 Testing Daily Reset Functionality...\n');
  
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
    
    // Test 2: Test manual daily reset endpoint
    console.log('\n2️⃣ Testing manual daily reset endpoint...');
    const resetResponse = await fetch(`${API_BASE}/employee/manual-daily-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (resetResponse.ok) {
      const resetResult = await resetResult.json();
      console.log('✅ Manual reset successful:', resetResult);
    } else {
      console.log('❌ Manual reset failed:', resetResponse.status);
      const errorText = await resetResponse.text();
      console.log('Error details:', errorText);
    }
    
    // Test 3: Check employee attendance after reset
    console.log('\n3️⃣ Checking employee attendance after reset...');
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
      }
    } else {
      console.log('❌ Failed to fetch attendance data');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDailyReset();
