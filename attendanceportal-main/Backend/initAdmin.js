const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// Fixed admin initialization script for separated instances
// This script ensures admin user exists with correct schema validation

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function initializeAdmin() {
  try {
    console.log('🔧 Starting admin user initialization...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if admin user already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎯 Role:', existingAdmin.role);
      console.log('🏢 Department:', existingAdmin.department);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('password123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: password123');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password properly
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create admin user with EXACT schema requirements
      const adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Engineering', // Must match enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
        position: 'System Administrator',
        status: 'Active', // Must match enum: ['Active', 'Inactive', 'On Leave']
        phone: '+91-9876543210',
        employeeId: 'ADMIN001',
        domain: 'techcorp.com',
        address: '123 Admin Street, Tech City',
        salary: 'Competitive',
        manager: 'Self',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543211',
          address: '123 Admin Street, Tech City'
        },
        generalSettings: {
          companyName: 'TechCorp Solutions',
          workingHoursStart: '09:00 AM',
          workingHoursEnd: '05:00 PM'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false,
            hours: 0,
            date: null,
            timestamp: null
          },
          records: [],
          weeklySummaries: [],
          monthlySummaries: []
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      });
      
      // Validate the user before saving
      await adminUser.validate();
      console.log('✅ Admin user validation successful');
      
      // Save the admin user
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
        department: 'Engineering', // Must match enum
        position: 'Software Developer',
        status: 'Active', // Must match enum
        phone: '+91-9876543212',
        employeeId: 'EMP001',
        domain: 'techcorp.com',
        address: '456 Employee Street, Tech City',
        salary: 'Competitive',
        manager: 'Admin User',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9876543213',
          address: '456 Employee Street, Tech City'
        },
        generalSettings: {
          companyName: 'TechCorp Solutions',
          workingHoursStart: '09:00 AM',
          workingHoursEnd: '05:00 PM'
        },
        attendance: {
          today: {
            checkIn: null,
            checkOut: null,
            status: 'Absent',
            isLate: false,
            hours: 0,
            date: null,
            timestamp: null
          },
          records: [],
          weeklySummaries: [],
          monthlySummaries: []
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
        }
      });
      
      await sampleEmployee.validate();
      await sampleEmployee.save();
      console.log('✅ Sample employee created successfully');
    }
    
    // Verify the users exist
    const totalUsers = await Employee.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // List all users
    const allUsers = await Employee.find({}, 'email name role department status');
    console.log('👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name} - ${user.role}) [${user.department}] - ${user.status}`);
    });
    
    console.log('\n🔑 Login Credentials:');
    console.log('👑 Admin: admin@techcorp.com / password123');
    console.log('👤 Employee: venkatesh@gmail.com / venkatesh');
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    return true;
    
  } catch (error) {
    console.error('❌ Admin initialization failed:', error.message);
    console.error('Error details:', error);
    
    if (error.name === 'ValidationError') {
      console.error('🔍 Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    
    return false;
  }
}

// Export the function
module.exports = { initializeAdmin };

// Run if called directly
if (require.main === module) {
  initializeAdmin()
    .then(success => {
      if (success) {
        console.log('🎉 Admin initialization completed successfully!');
        process.exit(0);
      } else {
        console.log('❌ Admin initialization failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}
