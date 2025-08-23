const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// MongoDB connection URI - uses environment variable or defaults to localhost
const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function initAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Check if admin user with new email exists
    const existingAdmin = await Employee.findOne({ email: 'admin@portal.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🎯 Role:', existingAdmin.role);
      console.log('🏢 Department:', existingAdmin.department);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: Admin@123');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password securely
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      // Create admin user with specified requirements
      const adminUser = new Employee({
        name: 'Admin',
        email: 'admin@portal.com',
        password: hashedPassword,
        role: 'admin',
        department: 'HR',
        position: 'Administrator',
        status: 'Active',
        joinDate: new Date(),
        phone: '+91-9999999999',
        employeeId: 'ADMIN001',
        address: '123 Admin Street, Tech City',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Spouse',
          phone: '+91-9999999998',
          email: 'emergency@portal.com'
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
    
    // Verify admin user exists and can be found
    const verifyAdmin = await Employee.findOne({ email: 'admin@portal.com' });
    if (verifyAdmin) {
      console.log('✅ Admin user verification successful');
      
      // Test password
      const isPasswordValid = await bcrypt.compare('Admin@123', verifyAdmin.password);
      console.log('🔑 Password test result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    }
    
    // Check total users
    const totalUsers = await Employee.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // List all users for verification
    const allUsers = await Employee.find({}, 'email name role department employeeId');
    console.log('👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name} - ${user.role}) [${user.employeeId}] - ${user.department}`);
    });
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('📧 Email: admin@portal.com');
    console.log('🔐 Password: Admin@123');
    console.log('🎯 Role: admin');
    console.log('🏢 Department: HR');
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

// Export the function for use in other modules
module.exports = { initAdmin };

// Run the function if this script is executed directly
if (require.main === module) {
  initAdmin()
    .then(success => {
      if (success) {
        console.log('🎉 Admin initialization completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Admin initialization failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
