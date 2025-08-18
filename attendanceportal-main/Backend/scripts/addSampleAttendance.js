const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function addSampleAttendance() {
  const empEmail = process.argv[2] || 'demo1@gmail.com';
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected');

    const employee = await Employee.findOne({ email: empEmail });
    if (!employee) {
      console.log(`❌ Employee not found: ${empEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found employee: ${employee.name}`);

    // Add sample attendance records for August 2025
    const sampleRecords = [
      {
        date: '2025-08-01',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-02',
        checkIn: '09:15 AM',
        checkOut: '05:45 PM',
        status: 'Late',
        hours: 8.5,
        isLate: true
      },
      {
        date: '2025-08-04',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-05',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-06',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-07',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-08',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-11',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-12',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-13',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-14',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-15',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-18',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-19',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-22',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-25',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-26',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-27',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-28',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      },
      {
        date: '2025-08-29',
        checkIn: '09:00 AM',
        checkOut: '05:45 PM',
        status: 'Present',
        hours: 8.75,
        isLate: false
      }
    ];

    // Initialize attendance records array if it doesn't exist
    if (!employee.attendance.records) {
      employee.attendance.records = [];
    }

    // Add sample records
    for (const record of sampleRecords) {
      const existingIndex = employee.attendance.records.findIndex(r => r.date === record.date);
      if (existingIndex >= 0) {
        // Update existing record
        employee.attendance.records[existingIndex] = record;
        console.log(`✅ Updated attendance for ${record.date}`);
      } else {
        // Add new record
        employee.attendance.records.push(record);
        console.log(`✅ Added attendance for ${record.date}`);
      }
    }

    await employee.save();
    console.log(`🎉 Added ${sampleRecords.length} sample attendance records for ${employee.name}`);
    console.log('📅 Calendar should now show Present, Late, Weekend, Holiday, and Leave days');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

addSampleAttendance();
