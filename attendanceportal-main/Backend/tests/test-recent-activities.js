const http = require('http');

// Test the recent activities route for admin dashboard
const testRecentActivities = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employee/admin/recent-activities',
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
      console.log('\n=== Recent Activities Response ===');
      try {
        const parsed = JSON.parse(data);
        console.log(`Total Activities: ${parsed.totalActivities}`);
        console.log(`Limit: ${parsed.limit}`);
        console.log('\nRecent Activities:');
        
        parsed.recentActivities.forEach((activity, index) => {
          console.log(`\n${index + 1}. ${activity.employeeName} (${activity.employeeEmail})`);
          console.log(`   Time: ${activity.timestamp}`);
          console.log(`   Status: ${activity.status}`);
          console.log(`   Description: ${activity.description}`);
          console.log(`   Type: ${activity.type}`);
          console.log(`   Icon: ${activity.icon}`);
          console.log(`   Color: ${activity.color}`);
          console.log(`   Today: ${activity.isToday}`);
          if (activity.date) {
            console.log(`   Date: ${activity.date}`);
          }
        });
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

// Test with custom limit
const testRecentActivitiesWithLimit = (limit) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/employee/admin/recent-activities?limit=${limit}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== Recent Activities with Limit ${limit} ===`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`Total Activities: ${parsed.totalActivities}`);
        console.log(`Limit Applied: ${parsed.limit}`);
        console.log(`Activities Returned: ${parsed.recentActivities.length}`);
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

console.log('Testing Recent Activities Route for Admin Portal...\n');
testRecentActivities();

setTimeout(() => {
  testRecentActivitiesWithLimit(5);
}, 1000);

setTimeout(() => {
  testRecentActivitiesWithLimit(3);
}, 2000);
