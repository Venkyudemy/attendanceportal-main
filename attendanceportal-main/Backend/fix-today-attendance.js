const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixTodayAttendance() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('❌ No employees found.');
      return;
    }

    let fixedCount = 0;

    for (const employee of employees) {
      try {
        console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
        
        if (!employee.attendance) {
          console.log('  ⚠️ No attendance data found, skipping...');
          continue;
        }

        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        console.log(`  📅 Today's date: ${today}`);

        // Check today's attendance status
        if (employee.attendance.today) {
          console.log(`  📊 Current today's status: ${employee.attendance.today.status}`);
          console.log(`  📊 Current today's check-in: ${employee.attendance.today.checkIn}`);
          console.log(`  📊 Current today's isLate: ${employee.attendance.today.isLate}`);

          // If today's status is 'Late', we need to fix it
          if (employee.attendance.today.status === 'Late') {
            console.log(`  🔧 Fixing today's late status...`);
            
            // Check if there's a record for today
            const todayRecord = employee.attendance.records.find(r => r.date === today);
            
            if (todayRecord && todayRecord.status === 'Late') {
              console.log(`  🗑️ Removing today's late record from records array`);
              const recordIndex = employee.attendance.records.indexOf(todayRecord);
              if (recordIndex > -1) {
                employee.attendance.records.splice(recordIndex, 1);
              }
            }

            // Reset today's attendance to allow fresh check-in
            employee.attendance.today = {
              checkIn: null,
              checkOut: null,
              status: 'Absent',
              isLate: false,
              hours: 0,
              date: today,
              timestamp: null
            };

            console.log(`  ✅ Today's attendance reset to allow fresh check-in`);
            fixedCount++;
          } else {
            console.log(`  ✅ Today's attendance status is correct: ${employee.attendance.today.status}`);
          }
        } else {
          console.log(`  📅 No today's attendance data found`);
        }

        // Save the updated employee
        console.log('  💾 Saving updated employee data...');
        await employee.save();
        console.log('  ✅ Employee today\'s attendance fixed successfully');

      } catch (error) {
        console.error(`  ❌ Error updating employee ${employee.name}:`, error.message);
      }
    }

    console.log('\n🎉 Today\'s attendance fixing completed!');
    console.log(`✅ Employees fixed: ${fixedCount}`);

    // Final verification
    console.log('\n🔍 Final verification...');
    const verifiedEmployees = await Employee.find({});
    for (const emp of verifiedEmployees) {
      if (emp.attendance && emp.attendance.today) {
        console.log(`\n👤 ${emp.name}:`);
        console.log(`  📅 Today's status: ${emp.attendance.today.status}`);
        console.log(`  📅 Today's check-in: ${emp.attendance.today.checkIn || 'None'}`);
        console.log(`  📅 Today's isLate: ${emp.attendance.today.isLate}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during today\'s attendance fixing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixTodayAttendance();
