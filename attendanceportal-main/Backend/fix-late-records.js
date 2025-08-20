const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function fixLateRecords() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Find the specific employee with the late records issue
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    for (const employee of employees) {
      console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
      
      if (!employee.attendance || !employee.attendance.records) {
        console.log('  ⚠️ No attendance data found, skipping...');
        continue;
      }

      console.log(`  📋 Found ${employee.attendance.records.length} attendance records`);

      let hasLateRecords = false;
      let updatedRecords = false;

      // Check for late records and fix them
      for (const record of employee.attendance.records) {
        if (record.status === 'Late') {
          console.log(`  🔧 Found late record for ${record.date}, fixing...`);
          hasLateRecords = true;
          
          // Option 1: Remove the record entirely (as requested to make it zero)
          const recordIndex = employee.attendance.records.indexOf(record);
          if (recordIndex > -1) {
            employee.attendance.records.splice(recordIndex, 1);
            console.log(`  ✅ Removed late record for ${record.date}`);
          }
          updatedRecords = true;
          
          console.log(`  ✅ Fixed record for ${record.date}: status set to empty`);
        }
      }

      if (hasLateRecords && updatedRecords) {
        // Recalculate summaries after fixing records
        const weeklyData = {};
        const monthlyData = {};

        for (const record of employee.attendance.records) {
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
              late: 0,
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
              late: 0,
              totalHours: 0
            };
          }

          // Update counts (only for non-empty status)
          if (record.status === 'Present') {
            weeklyData[weekStart].present++;
            monthlyData[monthKey].present++;
          } else if (record.status === 'Late') {
            weeklyData[weekStart].late++;
            monthlyData[monthKey].late++;
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
        console.log('  ✅ Employee late records fixed successfully');
      } else if (!hasLateRecords) {
        console.log('  ✅ No late records found, employee data is correct');
      }
    }

    console.log('\n🎉 Late records fixing completed!');

  } catch (error) {
    console.error('❌ Error during late records fixing:', error);
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

// Run the fix
fixLateRecords();
