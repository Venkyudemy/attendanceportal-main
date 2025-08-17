const http = require('http');

// Simple test to check if the server is running
const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Server not responding: ${e.message}`);
  });

  req.end();
};

console.log('🔍 Testing if server is running...');
testServer();
