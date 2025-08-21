const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixLeaveBalanceStructure() {
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
      
      let needsUpdate = false;
      
      // Initialize leave balance structure if missing
      if (!employee.leaveBalance) {
        employee.leaveBalance = {};
        needsUpdate = true;
        console.log('  🔧 Initializing missing leave balance structure');
      }

      // Check each configured leave type
      for (const leaveType of configuredLeaveTypes) {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        
        if (!employee.leaveBalance[typeKey]) {
          employee.leaveBalance[typeKey] = {
            total: leaveType.days || 0,
            used: 0,
            remaining: leaveType.days || 0
          };
          needsUpdate = true;
          console.log(`  🔧 Added missing leave type: ${leaveType.name} (${leaveType.days} days)`);
        } else {
          // Update total days if they changed in settings
          if (employee.leaveBalance[typeKey].total !== leaveType.days) {
            const oldTotal = employee.leaveBalance[typeKey].total;
            employee.leaveBalance[typeKey].total = leaveType.days || 0;
            employee.leaveBalance[typeKey].remaining = 
              (leaveType.days || 0) - employee.leaveBalance[typeKey].used;
            needsUpdate = true;
            console.log(`  🔧 Updated ${leaveType.name}: ${oldTotal} → ${leaveType.days} days`);
          }
        }
      }

      // Remove any leave types that are no longer in settings
      const configuredTypeKeys = configuredLeaveTypes.map(lt => 
        lt.name.toLowerCase().replace(/\s+/g, '')
      );
      
      for (const [typeKey, balance] of Object.entries(employee.leaveBalance)) {
        if (!configuredTypeKeys.includes(typeKey)) {
          delete employee.leaveBalance[typeKey];
          needsUpdate = true;
          console.log(`  🗑️ Removed obsolete leave type: ${typeKey}`);
        }
      }

      if (needsUpdate) {
        await employee.save();
        fixedCount++;
        console.log(`  ✅ Employee leave balance structure updated`);
      } else {
        console.log(`  ✅ Employee leave balance structure is already correct`);
      }

      // Show current leave balance
      console.log(`  📊 Current leave balance:`);
      for (const [typeKey, balance] of Object.entries(employee.leaveBalance)) {
        console.log(`    ${typeKey}: ${balance.remaining}/${balance.total} (used: ${balance.used})`);
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
fixLeaveBalanceStructure();
