const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSpecificIssues() {
  console.log('🔍 Testing specific failing endpoints...\n');

  // Test 1: All Employees route
  console.log('1. Testing All Employees route...');
  try {
    const response = await axios.get(`${BASE_URL}/employee`);
    console.log('✅ All Employees - PASSED');
    console.log('   Response:', response.data.length, 'employees found');
  } catch (error) {
    console.log('❌ All Employees - FAILED');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
  }

  // Test 2: Today Holiday Check
  console.log('\n2. Testing Today Holiday Check...');
  try {
    const response = await axios.get(`${BASE_URL}/employee/today-holiday`);
    console.log('✅ Today Holiday Check - PASSED');
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Today Holiday Check - FAILED');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
  }

  // Test 3: Check if backend is running
  console.log('\n3. Testing Backend Health...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend Health - PASSED');
    console.log('   Status:', response.status);
  } catch (error) {
    console.log('❌ Backend Health - FAILED');
    console.log('   Error:', error.message);
  }

  // Test 4: Check available routes
  console.log('\n4. Testing Available Routes...');
  const routes = [
    '/employee/stats',
    '/employee/attendance',
    '/employee/admin/present',
    '/employee/admin/absent',
    '/employee/admin/late',
    '/leave-requests',
    '/settings',
    '/auth/login'
  ];

  for (const route of routes) {
    try {
      const response = await axios.get(`${BASE_URL}${route}`);
      console.log(`✅ ${route} - PASSED (${response.status})`);
    } catch (error) {
      console.log(`❌ ${route} - FAILED (${error.response?.status || 'Network Error'})`);
    }
  }
}

testSpecificIssues().catch(console.error);
