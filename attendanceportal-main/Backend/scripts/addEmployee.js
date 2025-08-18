const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function addEmployee() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    
    if (existingEmployee) {
      console.log('👤 Employee already exists, updating password...');
      // Update password
      const hashedPassword = await bcrypt.hash('venkatesh', 12);
      existingEmployee.password = hashedPassword;
      await existingEmployee.save();
      console.log('✅ Employee password updated successfully');
    } else {
      console.log('👤 Creating new employee...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('venkatesh', 12);
      
      // Create employee
      const employee = new Employee({
        name: 'Venkatesh',
        email: 'venkatesh@gmail.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Finance',
        position: 'Accountant',
        employeeId: 'EMP002',
        phone: '+91-9876543210',
        address: '456 Finance Street, Tech City',
        joinDate: new Date('2025-08-18'),
        status: 'Active',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543211',
          email: 'emergency@example.com'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false
          },
          history: []
        }
      });
      
      await employee.save();
      console.log('✅ Employee created successfully');
    }
    
    console.log('👤 Employee Login Credentials:');
    console.log('📧 Email: venkatesh@gmail.com');
    console.log('🔐 Password: venkatesh');
    console.log('🎯 Role: employee');
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error adding employee:', error.message);
    process.exit(1);
  }
}

addEmployee();
