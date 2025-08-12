// Simple backend connectivity test
const fetch = require('node-fetch');

async function testBackend() {
  console.log('Testing backend connectivity...');
  
  try {
    // Test root endpoint
    const rootResponse = await fetch('http://localhost:5000/');
    console.log('Root endpoint status:', rootResponse.status);
    
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('Root response:', rootData);
    }
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log('Health endpoint status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health response:', healthData);
    }
    
    console.log('✅ Backend is accessible!');
    
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error.message);
    console.log('Make sure the backend is running on port 5000');
  }
}

testBackend();
