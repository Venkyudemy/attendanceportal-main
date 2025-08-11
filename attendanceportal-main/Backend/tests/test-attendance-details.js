const http = require('http');

// Test the attendance-details route
const testAttendanceDetails = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employee/EMP001/attendance-details?month=1&year=2024',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

// Test the portal-data route to see if summaries are working
const testPortalData = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employee/EMP001/portal-data',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nPortal Data Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Portal Data Response:');
      try {
        const parsed = JSON.parse(data);
        console.log('Weekly Summary:', parsed.attendance.thisWeek);
        console.log('Monthly Summary:', parsed.attendance.thisMonth);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

console.log('Testing attendance-details route...');
testAttendanceDetails();

setTimeout(() => {
  console.log('\nTesting portal-data route...');
  testPortalData();
}, 1000);
