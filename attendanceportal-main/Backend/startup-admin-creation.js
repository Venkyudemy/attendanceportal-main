const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// This script ensures admin user exists when backend starts
// Use this for separated instances deployment

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function ensureAdminUserExists() {
  try {
    console.log('🔧 Ensuring admin user exists...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Check if admin user already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎯 Role:', existingAdmin.role);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('password123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: password123');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create admin user with complete structure
      const adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        employeeId: 'ADMIN001',
        phone: '+91-9876543210',
        address: '123 Admin Street, Tech City',
        joinDate: new Date(),
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
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('🆔 User ID:', adminUser._id);
    }
    
    // Check if sample employee exists
    let sampleEmployee = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    
    if (!sampleEmployee) {
      console.log('👤 Creating sample employee...');
      
      const empHashedPassword = await bcrypt.hash('venkatesh', 12);
      
      sampleEmployee = new Employee({
        name: 'Venkatesh',
        email: 'venkatesh@gmail.com',
        password: empHashedPassword,
        role: 'employee',
        position: 'Software Developer',
        department: 'Engineering',
        employeeId: 'EMP001',
        phone: '+91-9876543212',
        address: '456 Employee Street, Tech City',
        joinDate: new Date(),
        status: 'Active',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543213',
          email: 'emergency2@example.com'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false
          },
          history: []
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      });
      
      await sampleEmployee.save();
      console.log('✅ Sample employee created successfully');
    }
    
    console.log('\n🔑 Login Credentials:');
    console.log('👑 Admin: admin@techcorp.com / password123');
    console.log('👤 Employee: venkatesh@gmail.com / venkatesh');
    console.log('🎯 Total users in database:', await Employee.countDocuments());
    
    return true;
    
  } catch (error) {
    console.error('❌ Error ensuring admin user exists:', error.message);
    return false;
  }
}

module.exports = { ensureAdminUserExists };
