const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testLeaveStatusUpdate() {
  try {
    console.log('🔍 Testing Leave Status Update Functionality...\n');

    // Step 1: Get all leave requests
    console.log('1️⃣ Fetching all leave requests...');
    const leaveResponse = await fetch(`${API_BASE}/leave/admin`);
    const leaveRequests = await leaveResponse.json();
    console.log(`✅ Found ${leaveRequests.length} leave requests`);
    
    if (leaveRequests.length === 0) {
      console.log('❌ No leave requests found. Please create some leave requests first.');
      return;
    }

    // Step 2: Get the first leave request
    const firstRequest = leaveRequests[0];
    console.log(`\n2️⃣ Testing with leave request ID: ${firstRequest._id}`);
    console.log(`   Employee: ${firstRequest.employeeName} (${firstRequest.employeeId})`);
    console.log(`   Current Status: ${firstRequest.status}`);
    console.log(`   Leave Type: ${firstRequest.leaveType}`);

    // Step 3: Update the status to Approved
    console.log('\n3️⃣ Updating status to "Approved"...');
    const updateResponse = await fetch(`${API_BASE}/leave/${firstRequest._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Approved',
        adminNotes: 'Test approval from script'
      })
    });

    if (updateResponse.ok) {
      const updatedRequest = await updateResponse.json();
      console.log('✅ Status update successful!');
      console.log(`   New Status: ${updatedRequest.status}`);
      console.log(`   Admin Notes: ${updatedRequest.adminNotes}`);
    } else {
      const errorText = await updateResponse.text();
      console.log(`❌ Status update failed: ${updateResponse.status}`);
      console.log(`   Error: ${errorText}`);
    }

    // Step 4: Verify the update by fetching again
    console.log('\n4️⃣ Verifying the update...');
    const verifyResponse = await fetch(`${API_BASE}/leave/admin`);
    const updatedRequests = await verifyResponse.json();
    const updatedRequest = updatedRequests.find(req => req._id === firstRequest._id);
    
    if (updatedRequest && updatedRequest.status === 'Approved') {
      console.log('✅ Verification successful! Status is now "Approved"');
    } else {
      console.log('❌ Verification failed! Status was not updated properly');
    }

    // Step 5: Test employee-specific leave requests
    console.log('\n5️⃣ Testing employee-specific leave requests...');
    const employeeResponse = await fetch(`${API_BASE}/leave/employee/${firstRequest.employeeId}`);
    const employeeRequests = await employeeResponse.json();
    console.log(`✅ Found ${employeeRequests.length} leave requests for employee ${firstRequest.employeeName}`);
    
    const employeeRequest = employeeRequests.find(req => req._id === firstRequest._id);
    if (employeeRequest) {
      console.log(`   Employee can see their request with status: ${employeeRequest.status}`);
    } else {
      console.log('❌ Employee cannot see their updated request');
    }

    console.log('\n🎉 Leave status update test completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testLeaveStatusUpdate();
