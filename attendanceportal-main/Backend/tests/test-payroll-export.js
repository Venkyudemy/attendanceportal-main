// Test script for payroll export functionality
const axios = require('axios');

async function testPayrollExport() {
  try {
    console.log('🧪 Testing Payroll Export API...');
    
    // Test the export endpoint
    const response = await axios.get('http://localhost:5000/api/employee/payroll/export?format=csv', {
      responseType: 'text'
    });
    
    console.log('✅ Payroll export successful!');
    console.log('📄 CSV Content length:', response.data.length);
    console.log('📄 First 200 characters:', response.data.substring(0, 200));
    
    // Check if it's valid CSV
    if (response.data.includes('Employee Name,Email,Department')) {
      console.log('✅ Valid CSV format detected');
    } else {
      console.log('❌ Invalid CSV format');
    }
    
  } catch (error) {
    console.error('❌ Error testing payroll export:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
  }
}

// Run the test
testPayrollExport();
