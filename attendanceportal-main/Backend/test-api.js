const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const LeaveRequest = require('./models/LeaveRequest');
const Settings = require('./models/Settings');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testAPIEndpoint() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected');

    const employee = await Employee.findOne({ email: 'demo1@gmail.com' });
    if (!employee) {
      console.log('❌ Employee demo1 not found');
      return;
    }

    console.log('✅ Employee found:', employee.name);
    console.log('📊 Attendance records:', employee.attendance?.records?.length || 0);

    // Test the find-by-email endpoint logic
    console.log('\n🔍 Testing find-by-email endpoint...');
    const foundEmployee = await Employee.findOne({ email: 'demo1@gmail.com' }).select('-password');
    console.log('Found employee by email:', foundEmployee ? {id: foundEmployee._id, name: foundEmployee.name} : 'Not found');

    // Test the attendance details endpoint logic
    console.log('\n🔍 Testing attendance details endpoint...');
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

    // Get approved leave requests for this month
    let approvedLeaveRequests = [];
    
    // Try to find leave requests by both employeeId (string) and _id (ObjectId)
    if (employee.employeeId) {
      approvedLeaveRequests = await LeaveRequest.find({
        employeeId: employee.employeeId,
        status: 'Approved'
      });
      console.log(`🔍 Searching leave requests with employeeId: ${employee.employeeId}`);
    }
    
    // If no results, try with _id (ObjectId)
    if (approvedLeaveRequests.length === 0 && employee._id) {
      approvedLeaveRequests = await LeaveRequest.find({
        employeeId: employee._id,
        status: 'Approved'
      });
      console.log(`🔍 Searching leave requests with _id: ${employee._id}`);
    }
    
    // If still no results, try with _id as string
    if (approvedLeaveRequests.length === 0 && employee._id) {
      approvedLeaveRequests = await LeaveRequest.find({
        employeeId: employee._id.toString(),
        status: 'Approved'
      });
      console.log(`🔍 Searching leave requests with _id as string: ${employee._id.toString()}`);
    }
    
    console.log('📋 Found approved leave requests for calendar:', approvedLeaveRequests.length);

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
      
      // Check if this day has approved leave
      const leaveRequest = approvedLeaveRequests.find(request => {
        let startDate, endDate;
        
        if (request.startDate instanceof Date) {
          startDate = new Date(request.startDate);
        } else {
          startDate = new Date(request.startDate + 'T00:00:00');
        }
        
        if (request.endDate instanceof Date) {
          endDate = new Date(request.endDate);
        } else {
          endDate = new Date(request.endDate + 'T23:59:59');
        }
        
        const currentDayDate = new Date(targetYear, targetMonth, day);
        const isLeaveDay = currentDayDate >= startDate && currentDayDate <= endDate;
        
        return isLeaveDay;
      });
      
      // Find attendance record for this date
      const attendanceRecord = attendanceRecords.find(record => record.date === dateString);
      
      let status, checkIn, checkOut, hours, isLeave, leaveType;
      
      if (leaveRequest) {
        status = 'Leave';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = true;
        leaveType = leaveRequest.leaveType;
      } else if (isWeekend) {
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

    // Get month statistics
    const monthRecords = attendanceRecords.filter(record => {
      if (!record.date) return false;
      const [year, month, day] = record.date.split('-').map(Number);
      const recordDate = new Date(year, month - 1, day);
      return recordDate.getMonth() === targetMonth && recordDate.getFullYear() === targetYear;
    });

    const monthLeaveDays = calendarData.filter(day => day.isLeave).length;
    const monthPresentDays = calendarData.filter(day => day.status === 'Present').length;
    const monthLateDays = calendarData.filter(day => day.status === 'Late').length;
    const monthAbsentDays = calendarData.filter(day => day.status === 'Absent').length;

    const monthStats = {
      present: monthPresentDays,
      late: monthLateDays,
      absent: monthAbsentDays,
      leave: monthLeaveDays,
      totalHours: monthRecords.reduce((sum, r) => sum + (r.hours || 0), 0)
    };

    // Get holidays for this month
    let monthHolidays = [];
    try {
      const settings = await Settings.findOne();
      if (settings && settings.companyHolidays) {
        monthHolidays = settings.companyHolidays.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          return holidayDate.getMonth() === targetMonth && holidayDate.getFullYear() === targetYear;
        });
      }
    } catch (holidayError) {
      console.error('Error fetching holidays:', holidayError);
    }

    console.log('📊 Final response data:');
    console.log('  - Calendar data length:', calendarData.length);
    console.log('  - Month stats:', monthStats);
    console.log('  - Month holidays:', monthHolidays.length);
    console.log('  - Month:', targetMonth + 1);
    console.log('  - Year:', targetYear);

    console.log('\n✅ API endpoint test completed successfully!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

testAPIEndpoint();
