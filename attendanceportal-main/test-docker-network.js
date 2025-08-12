// Test backend connectivity from Docker network perspective
const fetch = require('node-fetch');

async function testBackendConnectivity() {
  console.log('Testing backend connectivity from Docker network...');
  
  const testUrls = [
    'http://backend:5000/api/health',
    'http://localhost:5000/api/health',
    'http://127.0.0.1:5000/api/health'
  ];

  for (const url of testUrls) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
        console.log(`✅ SUCCESS: ${url} is accessible!`);
        return true;
      } else {
        console.log(`❌ FAILED: ${url} returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${url} - ${error.message}`);
    }
  }
  
  console.log('\n❌ All backend URLs failed!');
  return false;
}

// Test frontend to backend communication
async function testFrontendBackendCommunication() {
  console.log('\nTesting frontend to backend communication...');
  
  try {
    // Simulate a login request
    const loginData = {
      email: 'admin@company.com',
      password: 'admin123'
    };
    
    const response = await fetch('http://backend:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`Login endpoint status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login response:', data);
      console.log('✅ Frontend can communicate with backend!');
    } else {
      console.log('❌ Login endpoint failed');
    }
  } catch (error) {
    console.log('❌ Frontend to backend communication failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('=== Docker Network Connectivity Test ===\n');
  
  const backendAccessible = await testBackendConnectivity();
  
  if (backendAccessible) {
    await testFrontendBackendCommunication();
  }
  
  console.log('\n=== Test Complete ===');
}

runTests();
