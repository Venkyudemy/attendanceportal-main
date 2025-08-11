const axios = require('axios');

async function testPayrollAPI() {
  try {
    console.log('Testing Payroll Calculation API...');
    
    // Test payroll calculation
    const response = await axios.get('http://localhost:5000/api/employee/payroll/calculate');
    
    console.log('✅ Payroll calculation successful!');
    console.log('Response status:', response.status);
    console.log('Payroll period:', response.data.payrollPeriod);
    console.log('Total working days:', response.data.totalWorkingDays);
    console.log('Fixed late penalty:', response.data.fixedLatePenalty);
    console.log('Number of employees:', response.data.payrollData.length);
    
    if (response.data.payrollData.length > 0) {
      console.log('\nSample employee data:');
      console.log(response.data.payrollData[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing payroll API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testPayrollAPI();
