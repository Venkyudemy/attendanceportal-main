const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_portal';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@company.com');
      console.log('Password: admin123');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new Employee({
      name: 'Admin User',
      email: 'admin@company.com',
      department: 'HR',
      position: 'System Administrator',
      status: 'Active',
      joinDate: '2023-01-01',
      phone: '+1 (555) 000-0000',
      password: hashedPassword,
      attendance: {
        today: {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        }
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('================================');
    console.log('🔐 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log('📧 Email: admin@company.com');
    console.log('🔑 Password: admin123');
    console.log('================================');
    console.log('Role: Admin (Full Access)');
    console.log('================================');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin(); 