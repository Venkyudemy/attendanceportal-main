const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

// Helper function to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

async function fixEmployeeSummaries() {
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

    let fixedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        console.log(`\n👤 Processing employee: ${employee.name} (${employee.email})`);
        
        if (!employee.attendance || !employee.attendance.records) {
          console.log('  ⚠️ No attendance data found, skipping...');
          continue;
        }

        console.log(`  📋 Found ${employee.attendance.records.length} attendance records`);

        // Clear existing summaries
        employee.attendance.weeklySummaries = [];
        employee.attendance.monthlySummaries = [];

        // Group records by week and month
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

          // Update counts
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

        console.log(`  📊 Created ${weeklySummaries.length} weekly summaries`);
        console.log(`  📈 Created ${monthlySummaries.length} monthly summaries`);

        // Show some sample data
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
        console.log('  ✅ Employee summaries updated successfully');
        fixedCount++;

      } catch (error) {
        console.error(`  ❌ Error updating employee ${employee.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Summary fixing completed!');
    console.log(`✅ Successfully fixed: ${fixedCount} employees`);
    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} employees`);
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifiedEmployees = await Employee.find({});
    for (const emp of verifiedEmployees) {
      if (emp.attendance && emp.attendance.records && emp.attendance.records.length > 0) {
        const latestRecord = emp.attendance.records[emp.attendance.records.length - 1];
        const latestWeek = emp.attendance.weeklySummaries[emp.attendance.weeklySummaries.length - 1];
        const latestMonth = emp.attendance.monthlySummaries[emp.attendance.monthlySummaries.length - 1];
        
        console.log(`\n👤 ${emp.name}:`);
        console.log(`  📅 Latest record: ${latestRecord.date} - ${latestRecord.status}`);
        if (latestWeek) {
          console.log(`  📊 Latest week: ${latestWeek.present} present, ${latestWeek.late} late, ${latestWeek.totalHours.toFixed(1)} hours`);
        }
        if (latestMonth) {
          console.log(`  📈 Latest month: ${latestMonth.present} present, ${latestMonth.late} late, ${latestMonth.totalHours.toFixed(1)} hours`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during summary fixing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixEmployeeSummaries();
