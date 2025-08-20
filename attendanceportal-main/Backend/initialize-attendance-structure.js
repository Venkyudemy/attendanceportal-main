const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function initializeAttendanceStructure() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('❌ No employees found. Please create some employees first.');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
        
        let needsUpdate = false;

        // Initialize attendance object if it doesn't exist
        if (!employee.attendance) {
          console.log('  📅 Initializing attendance object...');
          employee.attendance = {
            today: {
              checkIn: null,
              checkOut: null,
              status: 'Absent',
              isLate: false,
              hours: 0,
              date: null,
              timestamp: null
            },
            records: [],
            weeklySummaries: [],
            monthlySummaries: []
          };
          needsUpdate = true;
        }

        // Ensure today object exists
        if (!employee.attendance.today) {
          console.log('  📅 Initializing today\'s attendance...');
          employee.attendance.today = {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false,
            hours: 0,
            date: null,
            timestamp: null
          };
          needsUpdate = true;
        }

        // Ensure records array exists
        if (!Array.isArray(employee.attendance.records)) {
          console.log('  📋 Initializing attendance records array...');
          employee.attendance.records = [];
          needsUpdate = true;
        }

        // Ensure weekly summaries array exists
        if (!Array.isArray(employee.attendance.weeklySummaries)) {
          console.log('  📊 Initializing weekly summaries array...');
          employee.attendance.weeklySummaries = [];
          needsUpdate = true;
        }

        // Ensure monthly summaries array exists
        if (!Array.isArray(employee.attendance.monthlySummaries)) {
          console.log('  📈 Initializing monthly summaries array...');
          employee.attendance.monthlySummaries = [];
          needsUpdate = true;
        }

        // Add missing fields to today's attendance if they don't exist
        if (!employee.attendance.today.hasOwnProperty('hours')) {
          employee.attendance.today.hours = 0;
          needsUpdate = true;
        }
        if (!employee.attendance.today.hasOwnProperty('date')) {
          employee.attendance.today.date = null;
          needsUpdate = true;
        }
        if (!employee.attendance.today.hasOwnProperty('timestamp')) {
          employee.attendance.today.timestamp = null;
          needsUpdate = true;
        }

        // Add missing fields to attendance records if they don't exist
        for (const record of employee.attendance.records) {
          if (!record.hasOwnProperty('timestamp')) {
            record.timestamp = null;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          console.log('  💾 Saving updated employee data...');
          await employee.save();
          console.log('  ✅ Employee data updated successfully');
          updatedCount++;
        } else {
          console.log('  ✅ Employee already has proper attendance structure');
        }

      } catch (error) {
        console.error(`  ❌ Error updating employee ${employee.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Attendance structure initialization completed!');
    console.log(`✅ Successfully updated: ${updatedCount} employees`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} employees`);
    }

    // Verify the structure
    console.log('\n🔍 Verifying attendance structure...');
    const verifiedEmployees = await Employee.find({});
    for (const emp of verifiedEmployees) {
      console.log(`\n👤 ${emp.name}:`);
      console.log(`  - Has attendance object: ${!!emp.attendance}`);
      console.log(`  - Has today object: ${!!emp.attendance?.today}`);
      console.log(`  - Has records array: ${Array.isArray(emp.attendance?.records)}`);
      console.log(`  - Has weekly summaries: ${Array.isArray(emp.attendance?.weeklySummaries)}`);
      console.log(`  - Has monthly summaries: ${Array.isArray(emp.attendance?.monthlySummaries)}`);
      console.log(`  - Records count: ${emp.attendance?.records?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Error during attendance structure initialization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the initialization
initializeAttendanceStructure();
