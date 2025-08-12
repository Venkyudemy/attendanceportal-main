// Test script to verify backend endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('=== Testing Backend Endpoints ===\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Employee Stats',
      url: `${BASE_URL}/employee/stats`,
      method: 'GET'
    },
    {
      name: 'Employee Attendance',
      url: `${BASE_URL}/employee/attendance`,
      method: 'GET'
    },
    {
      name: 'Admin Recent Activities',
      url: `${BASE_URL}/employee/admin/recent-activities?limit=5`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${test.name}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ FAILED: ${test.name} - Status ${response.status}`);
        const errorData = await response.text();
        console.log(`Error:`, errorData);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name} - ${error.message}`);
    }
    
    console.log('---\n');
  }

  // Test with a specific employee ID (if available)
  try {
    console.log('Testing Employee Portal Data (with sample ID)');
    const response = await fetch(`${BASE_URL}/employee/EMP001/portal-data`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS: Employee Portal Data`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ FAILED: Employee Portal Data - Status ${response.status}`);
      const errorData = await response.text();
      console.log(`Error:`, errorData);
    }
  } catch (error) {
    console.log(`❌ ERROR: Employee Portal Data - ${error.message}`);
  }
}

testEndpoints().catch(console.error);
