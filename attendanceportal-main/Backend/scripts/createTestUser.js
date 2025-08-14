const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await Employee.findOne({ email: 'venkatesh111@gmail.com' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: venkatesh111@gmail.com');
      console.log('Password: password123');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Create test user
    const testUser = new Employee({
      name: 'Venkatesh Test User',
      email: 'venkatesh111@gmail.com',
      department: 'Engineering',
      position: 'Software Developer',
      status: 'Active',
      joinDate: '2023-01-01',
      phone: '+1 (555) 123-4567',
      password: hashedPassword,
      employeeId: 'EMP001',
      attendance: {
        today: {
          checkIn: '09:15 AM',
          checkOut: '05:30 PM',
          status: 'Present',
          isLate: true
        }
      }
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('================================');
    console.log('🔐 TEST USER LOGIN CREDENTIALS:');
    console.log('================================');
    console.log('📧 Email: venkatesh111@gmail.com');
    console.log('🔑 Password: password123');
    console.log('================================');
    console.log('Role: Employee');
    console.log('================================');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
