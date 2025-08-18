const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testCalendarEndpoint() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected');

    const employee = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log('✅ Employee found:', employee.name);
    console.log('📊 Attendance records:', employee.attendance?.records?.length || 0);

    // Simulate the calendar endpoint logic
    const targetMonth = 7; // August (0-based)
    const targetYear = 2025;
    const currentDate = new Date();
    
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    console.log('📅 Calendar parameters:');
    console.log('  - Days in month:', daysInMonth);
    console.log('  - Starting day of week:', startingDayOfWeek);
    console.log('  - Target month:', targetMonth);
    console.log('  - Target year:', targetYear);

    const attendanceRecords = Array.isArray(employee.attendance?.records)
      ? employee.attendance.records
      : [];

    console.log('📋 Attendance records found:', attendanceRecords.length);
    console.log('📋 Sample records:', attendanceRecords.slice(0, 3));

    const calendarData = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarData.push({
        date: null,
        day: '',
        dayName: '',
        status: 'empty',
        checkIn: null,
        checkOut: null,
        hours: 0,
        isToday: false,
        isLeave: false,
        leaveType: null
      });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day, 12, 0, 0);
      const dateString = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Find attendance record for this date
      const attendanceRecord = attendanceRecords.find(record => record.date === dateString);
      
      let status, checkIn, checkOut, hours, isLeave, leaveType;
      
      if (isWeekend) {
        status = 'Weekend';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = false;
        leaveType = null;
      } else if (attendanceRecord) {
        status = attendanceRecord.status;
        checkIn = attendanceRecord.checkIn;
        checkOut = attendanceRecord.checkOut;
        hours = attendanceRecord.hours || 0;
        isLeave = false;
        leaveType = null;
      } else {
        status = 'Absent';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = false;
        leaveType = null;
      }

      calendarData.push({
        date: date,
        day: day,
        dayName: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          timeZone: 'Asia/Kolkata'
        }),
        status,
        checkIn,
        checkOut,
        hours,
        isToday,
        isLeave,
        leaveType
      });
    }

    console.log('📅 Calendar data generated:', calendarData.length, 'days');
    console.log('📅 Sample calendar days:');
    calendarData.slice(0, 10).forEach((day, index) => {
      if (day.status !== 'empty') {
        console.log(`  Day ${day.day}: ${day.status} ${day.checkIn ? `(${day.checkIn}-${day.checkOut})` : ''}`);
      }
    });

    // Count statuses
    const presentDays = calendarData.filter(day => day.status === 'Present').length;
    const lateDays = calendarData.filter(day => day.status === 'Late').length;
    const absentDays = calendarData.filter(day => day.status === 'Absent').length;
    const weekendDays = calendarData.filter(day => day.status === 'Weekend').length;

    console.log('📊 Calendar summary:');
    console.log('  - Present days:', presentDays);
    console.log('  - Late days:', lateDays);
    console.log('  - Absent days:', absentDays);
    console.log('  - Weekend days:', weekendDays);
    console.log('  - Total calendar days:', calendarData.length);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

testCalendarEndpoint();
