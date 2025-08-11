const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('Testing Admin Total API...');

    // Test admin total endpoint
    const response = await axios.get('http://localhost:5000/api/employee/admin/total');

    console.log('✅ Admin total API successful!');
    console.log('Response status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    console.log('Number of employees:', response.data.employees ? response.data.employees.length : 'No employees array');
    
    if (response.data.employees && response.data.employees.length > 0) {
      console.log('\nSample employee data:');
      console.log(response.data.employees[0]);
    } else {
      console.log('\nNo employees found in response');
    }

  } catch (error) {
    console.error('❌ Error testing admin API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testAdminAPI();
