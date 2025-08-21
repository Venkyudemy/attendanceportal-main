const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixLeaveBalanceStructureV2() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get settings to see configured leave types
    const settings = await Settings.getSettings();
    const configuredLeaveTypes = settings.leaveTypes || [];
    
    console.log('📋 Configured leave types from settings:', configuredLeaveTypes);

    if (configuredLeaveTypes.length === 0) {
      console.log('⚠️ No leave types configured in settings. Using defaults...');
      // Set default leave types if none configured
      settings.leaveTypes = [
        { name: 'Annual Leave', days: 20, color: '#28a745' },
        { name: 'Sick Leave', days: 10, color: '#dc3545' },
        { name: 'Personal Leave', days: 5, color: '#ffc107' }
      ];
      await settings.save();
      console.log('✅ Default leave types saved to settings');
    }

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    let fixedCount = 0;

    for (const employee of employees) {
      console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
      
      // Create a completely new leave balance structure
      const newLeaveBalance = {};
      
      // Add each configured leave type
      for (const leaveType of configuredLeaveTypes) {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        newLeaveBalance[typeKey] = {
          total: leaveType.days || 0,
          used: 0,
          remaining: leaveType.days || 0
        };
        console.log(`  ✅ Added leave type: ${leaveType.name} (${leaveType.days} days)`);
      }

      // Check if the current leave balance has any used days we need to preserve
      if (employee.leaveBalance && typeof employee.leaveBalance === 'object') {
        for (const [typeKey, balance] of Object.entries(employee.leaveBalance)) {
          // Skip Mongoose internal properties
          if (typeKey.startsWith('$') || typeKey === '_doc' || typeKey === '__parent' || typeKey === '__' || typeKey === '$isNew') {
            continue;
          }
          
          // If this type exists in our new structure, preserve the used count
          if (newLeaveBalance[typeKey] && typeof balance === 'object' && balance.used) {
            newLeaveBalance[typeKey].used = balance.used || 0;
            newLeaveBalance[typeKey].remaining = newLeaveBalance[typeKey].total - newLeaveBalance[typeKey].used;
            console.log(`  📊 Preserved used days for ${typeKey}: ${balance.used}`);
          }
        }
      }

      // Update the employee with the new leave balance structure
      try {
        // Use updateOne to avoid Mongoose document issues
        await Employee.updateOne(
          { _id: employee._id },
          { $set: { leaveBalance: newLeaveBalance } }
        );
        
        fixedCount++;
        console.log(`  ✅ Employee leave balance structure updated`);
        
        // Show the new leave balance
        console.log(`  📊 New leave balance:`);
        for (const [typeKey, balance] of Object.entries(newLeaveBalance)) {
          console.log(`    ${typeKey}: ${balance.remaining}/${balance.total} (used: ${balance.used})`);
        }
        
      } catch (updateError) {
        console.error(`  ❌ Error updating employee ${employee.name}:`, updateError.message);
      }
    }

    console.log(`\n🎉 Leave balance structure fix completed!`);
    console.log(`✅ Fixed ${fixedCount} employees`);
    console.log(`✅ All employees now have correct leave balance structure based on admin settings`);

  } catch (error) {
    console.error('❌ Error fixing leave balance structure:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixLeaveBalanceStructureV2();
