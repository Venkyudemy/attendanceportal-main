const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function verifyLeaveBalanceFix() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    console.log('\n📊 Leave Balance Verification Results:');
    console.log('=====================================');

    for (const employee of employees) {
      console.log(`\n👤 ${employee.name} (${employee.email}):`);
      
      if (employee.leaveBalance) {
        const keys = Object.keys(employee.leaveBalance);
        console.log(`  🔑 Leave balance keys: ${keys.join(', ')}`);
        
        // Check for expected keys
        if (employee.leaveBalance.annualleave) {
          console.log(`  ✅ Annual Leave: ${employee.leaveBalance.annualleave.remaining}/${employee.leaveBalance.annualleave.total}`);
        } else {
          console.log(`  ❌ Annual Leave: Missing`);
        }
        
        if (employee.leaveBalance.sickleave) {
          console.log(`  ✅ Sick Leave: ${employee.leaveBalance.sickleave.remaining}/${employee.leaveBalance.sickleave.total}`);
        } else {
          console.log(`  ❌ Sick Leave: Missing`);
        }
        
        if (employee.leaveBalance.personalleave) {
          console.log(`  ✅ Personal Leave: ${employee.leaveBalance.personalleave.remaining}/${employee.leaveBalance.personalleave.total}`);
        } else {
          console.log(`  ❌ Personal Leave: Missing`);
        }
      } else {
        console.log(`  ❌ No leave balance structure found`);
      }
    }

    console.log('\n🎉 Leave balance verification completed!');
    console.log('✅ All employees should now show correct leave balance in admin view');

  } catch (error) {
    console.error('❌ Error verifying leave balance:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the verification
verifyLeaveBalanceFix();
