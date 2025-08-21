const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixLeaveBalanceFinal() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    for (const employee of employees) {
      console.log(`\n👤 Fixing leave balance for: ${employee.name} (${employee.email})`);
      
      // Create a completely clean leave balance structure
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

      // First unset the leaveBalance field, then set it
      await Employee.updateOne(
        { _id: employee._id },
        { $unset: { leaveBalance: 1 } }
      );
      
      // Then set the new leaveBalance
      const updatedEmployee = await Employee.findOneAndUpdate(
        { _id: employee._id },
        { $set: { leaveBalance: cleanLeaveBalance } },
        { new: true, runValidators: true }
      );
      
      if (updatedEmployee) {
        console.log(`✅ Fixed leave balance for ${employee.name}`);
        console.log('📊 New leave balance structure:');
        console.log(JSON.stringify(updatedEmployee.leaveBalance, null, 2));
      } else {
        console.log(`❌ Failed to update ${employee.name}`);
      }
    }

    console.log('\n🎉 Final leave balance fix completed!');

  } catch (error) {
    console.error('❌ Error fixing leave balance:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixLeaveBalanceFinal();
