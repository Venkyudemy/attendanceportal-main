const fetch = require('node-fetch');

async function testEmployeeRoute() {
  try {
    console.log('🧪 Testing Employee Route...');
    
    // First, get the list of employees to get an ID
    console.log('📋 Step 1: Getting employee list...');
    const listResponse = await fetch('http://localhost:5000/api/employee/attendance');
    
    if (!listResponse.ok) {
      console.log('❌ Failed to get employee list:', listResponse.status, listResponse.statusText);
      return;
    }
    
    const employees = await listResponse.json();
    
    if (employees.length === 0) {
      console.log('❌ No employees found. Please create some test users first.');
      return;
    }
    
    const testEmployee = employees[0];
    console.log(`✅ Found employee: ${testEmployee.name} (ID: ${testEmployee.id})`);
    
    // Now test the individual employee route
    console.log('🔍 Step 2: Testing individual employee route...');
    const detailResponse = await fetch(`http://localhost:5000/api/employee/details/${testEmployee.id}`);
    
    console.log('📡 Response status:', detailResponse.status);
    console.log('📡 Response ok:', detailResponse.ok);
    
    if (detailResponse.ok) {
      const employeeData = await detailResponse.json();
      console.log('✅ Employee details received successfully!');
      console.log('📊 Employee name:', employeeData.name);
      console.log('📊 Employee email:', employeeData.email);
      console.log('📊 Attendance status:', employeeData.attendance?.today?.status);
      console.log('📊 Check-in time:', employeeData.attendance?.today?.checkIn);
      console.log('📊 Check-out time:', employeeData.attendance?.today?.checkOut);
      console.log('📊 Late arrival:', employeeData.attendance?.today?.isLate);
    } else {
      const errorText = await detailResponse.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmployeeRoute();
