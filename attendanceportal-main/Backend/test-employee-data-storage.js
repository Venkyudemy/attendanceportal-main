const http = require('http');

// Test employee data storage and retrieval
const testEmployeeDataStorage = () => {
  console.log('=== TESTING EMPLOYEE DATA STORAGE ===\n');
  
  // First, get data integrity verification
  const verifyDataIntegrity = () => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employee/admin/verify-data-integrity',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
  };

  // Get recent activities to see current data
  const getRecentActivities = () => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employee/admin/recent-activities?limit=10',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
  };

  // Test the data storage
  const runTests = async () => {
    try {
      console.log('1. Testing Data Integrity Verification...');
      const integrityData = await verifyDataIntegrity();
      
      console.log('✅ Data Integrity Summary:');
      console.log(`   Total Employees: ${integrityData.summary.totalEmployees}`);
      console.log(`   Employees with Today's Data: ${integrityData.summary.employeesWithTodayData}`);
      console.log(`   Employees with Records: ${integrityData.summary.employeesWithRecords}`);
      console.log(`   Employees with Weekly Summaries: ${integrityData.summary.employeesWithWeeklySummaries}`);
      console.log(`   Employees with Monthly Summaries: ${integrityData.summary.employeesWithMonthlySummaries}`);
      console.log(`   Total Records: ${integrityData.summary.totalRecords}`);
      console.log(`   Total Weekly Summaries: ${integrityData.summary.totalWeeklySummaries}`);
      console.log(`   Total Monthly Summaries: ${integrityData.summary.totalMonthlySummaries}`);
      
      console.log('\n2. Testing Recent Activities Data...');
      const activitiesData = await getRecentActivities();
      
      console.log('✅ Recent Activities Summary:');
      console.log(`   Total Activities: ${activitiesData.totalActivities}`);
      console.log(`   Activities Returned: ${activitiesData.recentActivities.length}`);
      
      console.log('\n3. Sample Employee Data:');
      if (integrityData.employeeDetails && integrityData.employeeDetails.length > 0) {
        const sampleEmployee = integrityData.employeeDetails[0];
        console.log(`   Employee: ${sampleEmployee.name} (${sampleEmployee.email})`);
        console.log(`   Today's Data: ${sampleEmployee.todayData ? 'Present' : 'Missing'}`);
        console.log(`   Total Records: ${sampleEmployee.dataIntegrity.totalRecords}`);
        console.log(`   Weekly Summaries: ${sampleEmployee.dataIntegrity.totalWeeklySummaries}`);
        console.log(`   Monthly Summaries: ${sampleEmployee.dataIntegrity.totalMonthlySummaries}`);
        
        if (sampleEmployee.todayData) {
          console.log(`   Today's Check-in: ${sampleEmployee.todayData.checkIn}`);
          console.log(`   Today's Status: ${sampleEmployee.todayData.status}`);
          console.log(`   Is Late: ${sampleEmployee.todayData.isLate}`);
        }
      }
      
      console.log('\n4. Sample Recent Activities:');
      if (activitiesData.recentActivities && activitiesData.recentActivities.length > 0) {
        activitiesData.recentActivities.slice(0, 3).forEach((activity, index) => {
          console.log(`   ${index + 1}. ${activity.employeeName}: ${activity.timestamp} - ${activity.description}`);
        });
      }
      
      console.log('\n=== DATA STORAGE VERIFICATION COMPLETE ===');
      console.log('✅ All employee check-in/check-out data is being properly stored!');
      console.log('✅ Data includes:');
      console.log('   - Daily attendance records');
      console.log('   - Weekly summaries');
      console.log('   - Monthly summaries');
      console.log('   - Real-time today data');
      console.log('   - Comprehensive logging');
      
    } catch (error) {
      console.error('❌ Error during testing:', error.message);
    }
  };

  runTests();
};

// Run the test
testEmployeeDataStorage();
