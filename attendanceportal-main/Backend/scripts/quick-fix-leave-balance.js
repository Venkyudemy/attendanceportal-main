const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function quickFixLeaveBalance() {
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
      console.log(`\n👤 Fixing leave balance for: ${employee.name} (${employee.email})`);
      
      // Create a clean leave balance structure
      const cleanLeaveBalance = {
        annualleave: {
          total: 9,
          used: 0,
          remaining: 9
        },
        sickleave: {
          total: 10,
          used: 0,
          remaining: 10
        },
        personalleave: {
          total: 5,
          used: 0,
          remaining: 5
        }
      };

      // Update the employee with clean leave balance
      await Employee.updateOne(
        { _id: employee._id },
        { $set: { leaveBalance: cleanLeaveBalance } }
      );
      
      console.log(`✅ Fixed leave balance for ${employee.name}`);
      console.log('📊 New leave balance:', cleanLeaveBalance);
    }

    console.log('\n🎉 Quick leave balance fix completed!');

  } catch (error) {
    console.error('❌ Error fixing leave balance:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
quickFixLeaveBalance();
