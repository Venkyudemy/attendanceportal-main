const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/employee';

async function testAdminPortal() {
  console.log('🧪 Testing Admin Portal API Endpoints...\n');

  const endpoints = [
    { name: 'Total Employees', url: '/admin/total' },
    { name: 'Present Employees', url: '/admin/present' },
    { name: 'Late Employees', url: '/admin/late' },
    { name: 'Absent Employees', url: '/admin/absent' },
    { name: 'Employees on Leave', url: '/admin/leave' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📊 Testing: ${endpoint.name}`);
      const response = await fetch(`${BASE_URL}${endpoint.url}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: ${data.count} employees found`);
        
        if (data.employees && data.employees.length > 0) {
          console.log(`   Sample employee: ${data.employees[0].name} (${data.employees[0].attendance.status})`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 Admin Portal API Testing Complete!');
}

// Run the test
testAdminPortal().catch(console.error);
