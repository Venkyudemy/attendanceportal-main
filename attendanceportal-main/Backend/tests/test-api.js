const fetch = require('node-fetch');

async function testAPI() {
  try {
    // Test POST employee
    const response = await fetch('http://localhost:5000/api/employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Employee',
        email: 'test@company.com',
        department: 'Engineering',
        position: 'Developer',
        phone: '1234567890',
        joinDate: '2025-08-08',
        password: 'testpass123'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI(); 