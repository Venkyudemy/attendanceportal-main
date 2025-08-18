const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const MONGO_URI = 'mongodb://localhost:27017/attendanceportal';

async function updateAdminRole() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Find and update admin user
    const adminUser = await Employee.findOne({ email: 'admin@techcorp.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found, updating role...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Admin role updated successfully');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🎯 Role:', adminUser.role);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Verify the update
    const updatedAdmin = await Employee.findOne({ email: 'admin@techcorp.com' });
    if (updatedAdmin) {
      console.log('✅ Verification - Admin role:', updatedAdmin.role);
    }
    
    mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error.message);
    process.exit(1);
  }
}

updateAdminRole();
