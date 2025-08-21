const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixApprovedLeaveBalance() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get all approved leave requests
    const approvedRequests = await LeaveRequest.find({ status: 'Approved' });
    console.log(`Found ${approvedRequests.length} approved leave requests`);

    let fixedCount = 0;

    for (const request of approvedRequests) {
      console.log(`\n📋 Processing leave request for: ${request.employeeName}`);
      console.log(`   Leave Type: ${request.leaveType}`);
      console.log(`   Days: ${request.days || request.totalDays || 0}`);
      console.log(`   Employee ID: ${request.employeeId}`);

      // Find the employee
      const employee = await Employee.findOne({ employeeId: request.employeeId });
      if (!employee) {
        console.log(`   ❌ Employee not found for ID: ${request.employeeId}`);
        continue;
      }

      const leaveTypeKey = request.leaveType.toLowerCase().replace(' ', '');
      if (!employee.leaveBalance[leaveTypeKey]) {
        console.log(`   ❌ Leave type ${request.leaveType} not found in employee balance`);
        continue;
      }

      // Check if this request was already processed (has a flag)
      if (request.balanceUpdated) {
        console.log(`   ⚠️ Leave request already processed, skipping`);
        continue;
      }

      const daysToDeduct = request.days || request.totalDays || 0;
      const currentUsed = employee.leaveBalance[leaveTypeKey].used || 0;
      const currentRemaining = employee.leaveBalance[leaveTypeKey].remaining || 0;

      console.log(`   📊 Current balance: ${currentRemaining}/${employee.leaveBalance[leaveTypeKey].total} (used: ${currentUsed})`);

      // Update the leave balance
      employee.leaveBalance[leaveTypeKey].used = currentUsed + daysToDeduct;
      employee.leaveBalance[leaveTypeKey].remaining = 
        employee.leaveBalance[leaveTypeKey].total - employee.leaveBalance[leaveTypeKey].used;

      await employee.save();

      // Mark the leave request as processed
      await LeaveRequest.findByIdAndUpdate(request._id, { balanceUpdated: true });

      console.log(`   ✅ Updated balance: ${employee.leaveBalance[leaveTypeKey].remaining}/${employee.leaveBalance[leaveTypeKey].total} (used: ${employee.leaveBalance[leaveTypeKey].used})`);
      fixedCount++;
    }

    console.log(`\n🎉 Leave balance fix completed!`);
    console.log(`✅ Fixed ${fixedCount} approved leave requests`);

    // Show summary of all employees
    console.log(`\n📊 Employee Leave Balance Summary:`);
    const employees = await Employee.find({});
    for (const employee of employees) {
      console.log(`\n👤 ${employee.name} (${employee.email}):`);
      if (employee.leaveBalance) {
        for (const [typeKey, balance] of Object.entries(employee.leaveBalance)) {
          if (typeKey !== '_id' && typeof balance === 'object') {
            console.log(`   ${typeKey}: ${balance.remaining}/${balance.total} (used: ${balance.used})`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error fixing approved leave balance:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixApprovedLeaveBalance();
