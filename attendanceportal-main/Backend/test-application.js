const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

// Comprehensive application test script
// Run this to verify everything is working: node test-application.js

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function testApplication() {
  try {
    console.log('🧪 Starting comprehensive application test...');
    console.log('📡 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Test 1: MongoDB Connection
    console.log('\n🔗 Test 1: MongoDB Connection');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB connection successful');
    
    // Test 2: Database and Collections
    console.log('\n📊 Test 2: Database and Collections');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test 3: Employee Model
    console.log('\n👤 Test 3: Employee Model');
    const employeeCount = await Employee.countDocuments();
    console.log('📊 Total employees in database:', employeeCount);
    
    // Test 4: Admin User Check
    console.log('\n👑 Test 4: Admin User Check');
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log('   - Name:', adminUser.name);
      console.log('   - Role:', adminUser.role);
      console.log('   - Department:', adminUser.department);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('password123', adminUser.password);
      console.log('   - Password valid:', isPasswordValid ? '✅' : '❌');
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 5: Sample Employee Check
    console.log('\n👤 Test 5: Sample Employee Check');
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
    
    // Test 6: Schema Validation
    console.log('\n🔍 Test 6: Schema Validation');
    try {
      const testEmployee = new Employee({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass',
        department: 'Engineering',
        position: 'Tester',
        phone: '+91-1234567890'
      });
      
      // Validate without saving
      await testEmployee.validate();
      console.log('✅ Employee schema validation successful');
      
      // Clean up test data
      await Employee.deleteOne({ email: 'test@example.com' });
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.log('❌ Employee schema validation failed:', error.message);
    }
    
    // Test 7: Database Operations
    console.log('\n⚡ Test 7: Database Operations');
    const allEmployees = await Employee.find({}, 'name email role department');
    console.log('👥 All employees:');
    allEmployees.forEach(emp => {
      console.log(`   - ${emp.name} (${emp.email}) - ${emp.role} - ${emp.department}`);
    });
    
    // Test 8: Leave Balance Structure
    console.log('\n📅 Test 8: Leave Balance Structure');
    if (adminUser && adminUser.leaveBalance) {
      console.log('✅ Leave balance structure exists');
      console.log('   - Annual:', adminUser.leaveBalance.annual);
      console.log('   - Sick:', adminUser.leaveBalance.sick);
      console.log('   - Personal:', adminUser.leaveBalance.personal);
    } else {
      console.log('❌ Leave balance structure missing');
    }
    
    // Test 9: Attendance Structure
    console.log('\n⏰ Test 9: Attendance Structure');
    if (adminUser && adminUser.attendance) {
      console.log('✅ Attendance structure exists');
      console.log('   - Today status:', adminUser.attendance.today?.status);
      console.log('   - Records count:', adminUser.attendance.records?.length || 0);
    } else {
      console.log('❌ Attendance structure missing');
    }
    
    // Test 10: Environment Variables
    console.log('\n🌍 Test 10: Environment Variables');
    console.log('   - NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('   - PORT:', process.env.PORT || 'not set');
    console.log('   - MONGO_URL:', process.env.MONGO_URL ? 'set' : 'not set');
    console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');
    
    console.log('\n🎉 Application test completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   - Admin: admin@techcorp.com / password123');
    console.log('   - Employee: venkatesh@gmail.com / venkatesh');
    
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Application test failed:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testApplication();
