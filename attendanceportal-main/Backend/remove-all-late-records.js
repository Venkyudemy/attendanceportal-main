const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function removeAllLateRecords() {
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

    let totalLateRecordsRemoved = 0;
    let employeesFixed = 0;

    for (const employee of employees) {
      try {
        console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
        
        if (!employee.attendance || !employee.attendance.records) {
          console.log('  ⚠️ No attendance data found, skipping...');
          continue;
        }

        const originalCount = employee.attendance.records.length;
        console.log(`  📋 Found ${originalCount} attendance records`);

        // Remove ALL late records
        const cleanRecords = [];
        let lateRecordsRemoved = 0;

        for (const record of employee.attendance.records) {
          if (record.status === 'Late') {
            console.log(`  🗑️ Removing late record for ${record.date} (${record.checkIn})`);
            lateRecordsRemoved++;
          } else {
            cleanRecords.push(record);
          }
        }

        if (lateRecordsRemoved > 0) {
          console.log(`  ✅ Removed ${lateRecordsRemoved} late records`);
          totalLateRecordsRemoved += lateRecordsRemoved;
          
          // Update employee records
          employee.attendance.records = cleanRecords;

          // Reset today's attendance if it was late
          const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          if (employee.attendance.today && employee.attendance.today.status === 'Late') {
            console.log(`  🔧 Resetting today's late status`);
            employee.attendance.today = {
              checkIn: null,
              checkOut: null,
              status: 'Absent',
              isLate: false,
              hours: 0,
              date: today,
              timestamp: null
            };
          }

          // Recalculate summaries with NO late records
          const weeklyData = {};
          const monthlyData = {};

          for (const record of cleanRecords) {
            if (!record.date || !record.status) continue;

            const recordDate = new Date(record.date);
            if (isNaN(recordDate.getTime())) continue;

            // Weekly grouping
            const weekStart = getWeekStart(recordDate);
            if (!weeklyData[weekStart]) {
              weeklyData[weekStart] = {
                weekStart: weekStart,
                present: 0,
                absent: 0,
                late: 0, // This will always be 0 now
                totalHours: 0
              };
            }

            // Monthly grouping
            const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = {
                month: monthKey,
                present: 0,
                absent: 0,
                late: 0, // This will always be 0 now
                totalHours: 0
              };
            }

            // Update counts (NO late records)
            if (record.status === 'Present') {
              weeklyData[weekStart].present++;
              monthlyData[monthKey].present++;
            } else if (record.status === 'Absent') {
              weeklyData[weekStart].absent++;
              monthlyData[monthKey].absent++;
            }

            // Update hours
            const hours = record.hours || 0;
            weeklyData[weekStart].totalHours += hours;
            monthlyData[monthKey].totalHours += hours;
          }

          // Convert to arrays and sort
          const weeklySummaries = Object.values(weeklyData).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
          const monthlySummaries = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

          // Update employee data
          employee.attendance.weeklySummaries = weeklySummaries;
          employee.attendance.monthlySummaries = monthlySummaries;

          console.log(`  📊 Updated summaries: ${weeklySummaries.length} weekly, ${monthlySummaries.length} monthly`);

          // Show updated summary
          if (weeklySummaries.length > 0) {
            const latestWeek = weeklySummaries[weeklySummaries.length - 1];
            console.log(`  📅 Latest week (${latestWeek.weekStart}): ${latestWeek.present} present, ${latestWeek.late} late, ${latestWeek.absent} absent, ${latestWeek.totalHours.toFixed(1)} hours`);
          }

          if (monthlySummaries.length > 0) {
            const latestMonth = monthlySummaries[monthlySummaries.length - 1];
            console.log(`  📅 Latest month (${latestMonth.month}): ${latestMonth.present} present, ${latestMonth.late} late, ${latestMonth.absent} absent, ${latestMonth.totalHours.toFixed(1)} hours`);
          }

          // Save the updated employee
          console.log('  💾 Saving updated employee data...');
          await employee.save();
          console.log('  ✅ Employee late records completely removed');
          employeesFixed++;
        } else {
          console.log('  ✅ No late records found');
        }

      } catch (error) {
        console.error(`  ❌ Error updating employee ${employee.name}:`, error.message);
      }
    }

    console.log('\n🎉 Late records removal completed!');
    console.log(`✅ Total late records removed: ${totalLateRecordsRemoved}`);
    console.log(`✅ Employees fixed: ${employeesFixed}`);

    // Final verification - ensure NO late records exist
    console.log('\n🔍 Final verification - checking for any remaining late records...');
    const finalCheck = await Employee.find({});
    let anyLateRecordsFound = false;

    for (const emp of finalCheck) {
      if (emp.attendance && emp.attendance.records) {
        const lateRecords = emp.attendance.records.filter(r => r.status === 'Late');
        if (lateRecords.length > 0) {
          console.log(`❌ WARNING: ${emp.name} still has ${lateRecords.length} late records!`);
          anyLateRecordsFound = true;
        }
      }
    }

    if (!anyLateRecordsFound) {
      console.log('✅ SUCCESS: No late records found in any employee data!');
    } else {
      console.log('❌ FAILURE: Some late records still exist!');
    }

  } catch (error) {
    console.error('❌ Error during late records removal:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Helper function to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

// Run the removal
removeAllLateRecords();
