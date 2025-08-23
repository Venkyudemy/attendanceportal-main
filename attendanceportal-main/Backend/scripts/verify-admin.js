const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function verifyAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if admin user exists
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🎯 Role:', adminUser.role);
      console.log('🆔 Employee ID:', adminUser.employeeId);
      console.log('📅 Created:', adminUser.createdAt);
      
      // Test password
      const bcrypt = require('bcryptjs');
      const testPassword = 'password123';
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log('🔑 Password test result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
      
      if (!isPasswordValid) {
        console.log('⚠️  Password mismatch! Updating password...');
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Password updated successfully');
      }
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('💡 This means the initialization script failed');
      console.log('🔧 You may need to run createAdmin.js manually');
    }
    
    // Check total users
    const totalUsers = await Employee.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // List all users
    const allUsers = await Employee.find({}, 'email name role employeeId');
    console.log('👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name} - ${user.role}) [${user.employeeId}]`);
    });
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error verifying admin user:', error.message);
    process.exit(1);
  }
}

// Run the verification
verifyAdminUser();
