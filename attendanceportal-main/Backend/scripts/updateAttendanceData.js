const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

async function updateAttendanceData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    // Update each employee with realistic attendance data
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      // Generate random but realistic attendance data
      const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
      const checkOutMinute = Math.floor(Math.random() * 60);
      
      const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')} ${checkInHour < 12 ? 'AM' : 'PM'}`;
      const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')} ${checkOutHour < 12 ? 'AM' : 'PM'}`;
      
      const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15);
      const status = isLate ? 'Late' : 'Present';
      
      // Update attendance data
      await Employee.findByIdAndUpdate(employee._id, {
        'attendance.today.checkIn': checkInTime,
        'attendance.today.checkOut': checkOutTime,
        'attendance.today.status': status,
        'attendance.today.isLate': isLate
      });
      
      console.log(`Updated ${employee.name}: ${checkInTime} - ${checkOutTime} (${status})`);
    }

    console.log('✅ All employees updated with realistic attendance data!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error updating attendance data:', error);
    process.exit(1);
  }
}

updateAttendanceData();
