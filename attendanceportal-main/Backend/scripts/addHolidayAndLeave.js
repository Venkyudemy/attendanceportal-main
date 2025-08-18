const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function run() {
  const empEmail = process.env.EMP_EMAIL || process.argv[2];
  const startDate = process.env.START_DATE || process.argv[3]; // YYYY-MM-DD
  const endDate = process.env.END_DATE || process.argv[4] || startDate; // YYYY-MM-DD
  const leaveType = process.env.LEAVE_TYPE || process.argv[5] || 'Casual Leave';

  if (!empEmail) {
    console.log('Usage: node scripts/addHolidayAndLeave.js <EMP_EMAIL> [START_DATE YYYY-MM-DD] [END_DATE YYYY-MM-DD] [LEAVE_TYPE]');
    console.log('Example: node scripts/addHolidayAndLeave.js demo1@company.com 2025-08-10 2025-08-11 "Sick Leave"');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected');

    // 1) Ensure there is at least one company holiday in the current month
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const sampleHolidayDate = `${y}-${m}-15`;

    let settings = await Settings.getSettings();
    settings.companyHolidays = settings.companyHolidays || [];
    const hasHolidayThisMonth = settings.companyHolidays.some(h => {
      const d = new Date(h.date);
      return d.getFullYear() === y && d.getMonth() === today.getMonth();
    });

    if (!hasHolidayThisMonth) {
      settings.companyHolidays.push({
        name: 'Company Holiday',
        date: sampleHolidayDate,
        type: 'company',
        description: 'Auto-added sample holiday for this month'
      });
      await settings.save();
      console.log(`✅ Added company holiday on ${sampleHolidayDate}`);
    } else {
      console.log('ℹ️ Holiday already exists for this month – not adding another');
    }

    // 2) Create an approved leave for the employee
    const employee = await Employee.findOne({ email: empEmail });
    if (!employee) {
      console.log(`❌ Employee not found for email: ${empEmail}`);
      process.exit(1);
    }

    const sd = startDate || `${y}-${m}-10`;
    const ed = endDate || sd;

    const leave = new LeaveRequest({
      employeeId: employee._id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      leaveType,
      startDate: sd,
      endDate: ed,
      totalDays: 1,
      reason: 'Sample leave (auto-added)',
      status: 'Approved'
    });
    await leave.save();
    console.log(`✅ Created approved leave for ${employee.email} from ${sd} to ${ed} (${leaveType})`);

    console.log('\n🎉 Done. Refresh the calendar for the employee to see holiday and leave highlighted.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

run();
