const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testLeaveBalanceAPI() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get settings
    const settings = await Settings.getSettings();
    console.log('📋 Settings leave types:', settings.leaveTypes);

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    for (const employee of employees) {
      console.log(`\n👤 Testing leave balance for: ${employee.name} (${employee.email})`);
      console.log('Employee ID:', employee._id);
      
      // Check current leave balance structure
      console.log('📊 Current leave balance structure:');
      console.log(JSON.stringify(employee.leaveBalance, null, 2));
      
      // Check if leave balance has the correct keys
      if (employee.leaveBalance) {
        const keys = Object.keys(employee.leaveBalance);
        console.log('🔑 Leave balance keys:', keys);
        
        // Check for expected keys
        const expectedKeys = ['annualleave', 'sickleave', 'personalleave'];
        for (const key of expectedKeys) {
          if (employee.leaveBalance[key]) {
            console.log(`✅ ${key}:`, employee.leaveBalance[key]);
          } else {
            console.log(`❌ ${key}: Missing`);
          }
        }
      } else {
        console.log('❌ No leave balance structure found');
      }
      
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Error testing leave balance API:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test
testLeaveBalanceAPI();
