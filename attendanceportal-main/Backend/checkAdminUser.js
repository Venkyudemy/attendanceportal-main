const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

const MONGO_URI = 'mongodb://localhost:27017/attendanceportal';

async function checkAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if admin user exists
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found in database');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🎯 Role:', adminUser.role);
      console.log('🔐 Password hash exists:', !!adminUser.password);
      
      // Test password
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
      console.log('❌ Admin user not found in database');
      console.log('🔧 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      const adminUser = new Employee({
        name: 'Admin User',
        email: 'admin@techcorp.com',
        password: hashedPassword,
        role: 'admin',
        position: 'System Administrator',
        department: 'Engineering',
        employeeId: 'ADMIN001',
        phone: '+91-9876543210',
        address: '123 Admin Street, Tech City',
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
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }
    
    // Check employee user
    const employeeUser = await Employee.findOne({ email: 'venkatesh@gmail.com' });
    if (employeeUser) {
      console.log('✅ Employee user found:', employeeUser.email);
    } else {
      console.log('❌ Employee user not found');
    }
    
    // List all users
    const allUsers = await Employee.find({}, 'email name role');
    console.log('📋 All users in database:');
    allUsers.forEach(user => {
      console.log('   -', user.email, '(', user.name, '-', user.role, ')');
    });
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
