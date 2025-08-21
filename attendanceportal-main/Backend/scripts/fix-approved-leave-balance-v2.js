const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixApprovedLeaveBalanceV2() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // First, fix the leave balance structure for all employees
    console.log('\n🔧 Fixing leave balance structure first...');
    const employees = await Employee.find({});
    
    for (const employee of employees) {
      console.log(`\n👤 Fixing leave balance for: ${employee.name} (${employee.email})`);
      
      // Create a clean leave balance structure
      const cleanLeaveBalance = {
        annual: {
          total: 20,
          used: 0,
          remaining: 20
        },
        sick: {
          total: 10,
          used: 0,
          remaining: 10
        },
        personal: {
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
      
      console.log(`✅ Fixed leave balance structure for ${employee.name}`);
    }

    // Now get all approved leave requests
    const approvedRequests = await LeaveRequest.find({ status: 'Approved' });
    console.log(`\n📋 Found ${approvedRequests.length} approved leave requests`);

    let fixedCount = 0;

    for (const request of approvedRequests) {
      console.log(`\n📋 Processing leave request for: ${request.employeeName}`);
      console.log(`   Leave Type: ${request.leaveType}`);
      console.log(`   Days: ${request.days || request.totalDays || 0}`);
      console.log(`   Employee ID: ${request.employeeId}`);

      // Find the employee by ObjectId
      let employee;
      if (mongoose.Types.ObjectId.isValid(request.employeeId)) {
        employee = await Employee.findById(request.employeeId);
      } else {
        employee = await Employee.findOne({ employeeId: request.employeeId });
      }

      if (!employee) {
        console.log(`   ❌ Employee not found for ID: ${request.employeeId}`);
        continue;
      }

      // Map leave type to the correct key
      let leaveTypeKey;
      if (request.leaveType.toLowerCase().includes('annual')) {
        leaveTypeKey = 'annual';
      } else if (request.leaveType.toLowerCase().includes('sick')) {
        leaveTypeKey = 'sick';
      } else if (request.leaveType.toLowerCase().includes('personal')) {
        leaveTypeKey = 'personal';
      } else {
        console.log(`   ❌ Unknown leave type: ${request.leaveType}`);
        continue;
      }

      if (!employee.leaveBalance[leaveTypeKey]) {
        console.log(`   ❌ Leave type ${leaveTypeKey} not found in employee balance`);
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

      console.log(`   ✅ Updated balance: ${employee.leaveBalance[leaveTypeKey].remaining}/${employee.leaveBalance[leaveTypeKey].total} (used: ${employee.leaveBalance[leaveTypeKey].used})`);
      fixedCount++;
    }

    console.log(`\n🎉 Leave balance fix completed!`);
    console.log(`✅ Fixed ${fixedCount} approved leave requests`);

    // Show summary of all employees
    console.log(`\n📊 Employee Leave Balance Summary:`);
    const updatedEmployees = await Employee.find({});
    for (const employee of updatedEmployees) {
      console.log(`\n👤 ${employee.name} (${employee.email}):`);
      if (employee.leaveBalance) {
        for (const [typeKey, balance] of Object.entries(employee.leaveBalance)) {
          if (typeKey !== '_id' && typeof balance === 'object' && balance.total !== undefined) {
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
fixApprovedLeaveBalanceV2();
