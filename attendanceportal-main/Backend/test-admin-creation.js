const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// Simple test script to verify admin creation
// Run this to test: node test-admin-creation.js

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testAdminCreation() {
  try {
    console.log('🧪 Testing admin user creation...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Test 1: Connect to MongoDB
    console.log('\n🔗 Test 1: MongoDB Connection');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB connection successful');
    
    // Test 2: Check if admin exists
    console.log('\n👑 Test 2: Admin User Check');
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log('   - Name:', adminUser.name);
      console.log('   - Role:', adminUser.role);
      console.log('   - Department:', adminUser.department);
      console.log('   - Status:', adminUser.status);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('password123', adminUser.password);
      console.log('   - Password valid:', isPasswordValid ? '✅' : '❌');
      
      if (!isPasswordValid) {
        console.log('⚠️  Password is invalid, updating...');
        const hashedPassword = await bcrypt.hash('password123', 12);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Password updated successfully');
      }
    } else {
      console.log('❌ Admin user not found');
      console.log('💡 Run the initAdmin.js script to create the admin user');
    }
    
    // Test 3: Check sample employee
    console.log('\n👤 Test 3: Sample Employee Check');
    const sampleEmployee = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    
    if (sampleEmployee) {
      console.log('✅ Sample employee exists');
      console.log('   - Name:', sampleEmployee.name);
      console.log('   - Role:', sampleEmployee.role);
      console.log('   - Department:', sampleEmployee.department);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('venkatesh', sampleEmployee.password);
      console.log('   - Password valid:', isPasswordValid ? '✅' : '❌');
    } else {
      console.log('❌ Sample employee not found');
    }
    
    // Test 4: List all users
    console.log('\n📊 Test 4: All Users');
    const allUsers = await Employee.find({}, 'email name role department status');
    console.log('Total users:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ${user.role} - ${user.department}`);
    });
    
    console.log('\n🎉 Admin creation test completed!');
    console.log('\n🔑 Login Credentials:');
    console.log('   - Admin: admin@techcorp.com / password123');
    console.log('   - Employee: venkatesh@gmail.com / venkatesh');
    
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.name === 'ValidationError') {
      console.error('🔍 Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
  }
}

// Run the test
testAdminCreation();
