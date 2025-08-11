const fetch = require('node-fetch');

async function testRecalculateSummaries() {
  try {
    console.log('Testing recalculate summaries functionality...\n');

    // Test recalculating summaries for all employees
    console.log('1. Testing recalculate all summaries...');
    const allResponse = await fetch('http://localhost:5000/api/employee/admin/recalculate-all-summaries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (allResponse.ok) {
      const result = await allResponse.json();
      console.log('✅ Success:', result.message);
      console.log(`   Total employees: ${result.totalEmployees}`);
      console.log(`   Updated: ${result.updatedCount}`);
      console.log(`   Errors: ${result.errorCount}`);
    } else {
      const error = await allResponse.json();
      console.log('❌ Error:', error.message);
    }

    console.log('\n2. Testing individual employee portal data...');
    
    // Get all employees first
    const employeesResponse = await fetch('http://localhost:5000/api/employee');
    if (employeesResponse.ok) {
      const employees = await employeesResponse.json();
      
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        console.log(`   Testing with employee: ${firstEmployee.name} (ID: ${firstEmployee._id})`);
        
        // Test portal data
        const portalResponse = await fetch(`http://localhost:5000/api/employee/${firstEmployee._id}/portal-data`);
        if (portalResponse.ok) {
          const portalData = await portalResponse.json();
          console.log('✅ Portal data retrieved successfully');
          console.log(`   This week - Present: ${portalData.attendance.thisWeek.present}, Hours: ${portalData.attendance.thisWeek.totalHours}`);
          console.log(`   This month - Present: ${portalData.attendance.thisMonth.present}, Hours: ${portalData.attendance.thisMonth.totalHours}`);
        } else {
          const error = await portalResponse.json();
          console.log('❌ Portal data error:', error.message);
        }
      } else {
        console.log('❌ No employees found');
      }
    } else {
      console.log('❌ Could not fetch employees list');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRecalculateSummaries();
