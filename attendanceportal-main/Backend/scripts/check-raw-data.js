const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/attendanceportal';

async function checkRawData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Get the raw collection
    const db = mongoose.connection.db;
    const employeesCollection = db.collection('employees');
    
    // Get all employees
    const employees = await employeesCollection.find({}).toArray();
    console.log(`Found ${employees.length} employees`);

    console.log('\n📊 Raw MongoDB Data:');
    console.log('====================');

    for (const employee of employees) {
      console.log(`\n👤 ${employee.name} (${employee.email}):`);
      console.log('Employee ID:', employee._id);
      
      if (employee.leaveBalance) {
        console.log('📊 Leave Balance (raw):');
        console.log(JSON.stringify(employee.leaveBalance, null, 2));
        
        const keys = Object.keys(employee.leaveBalance);
        console.log('🔑 Leave balance keys:', keys);
        
        // Check for expected keys
        if (employee.leaveBalance.annual) {
          console.log(`✅ Annual Leave: ${employee.leaveBalance.annual.remaining}/${employee.leaveBalance.annual.total}`);
        } else {
          console.log(`❌ Annual Leave: Missing`);
        }
        
        if (employee.leaveBalance.sick) {
          console.log(`✅ Sick Leave: ${employee.leaveBalance.sick.remaining}/${employee.leaveBalance.sick.total}`);
        } else {
          console.log(`❌ Sick Leave: Missing`);
        }
        
        if (employee.leaveBalance.personal) {
          console.log(`✅ Personal Leave: ${employee.leaveBalance.personal.remaining}/${employee.leaveBalance.personal.total}`);
        } else {
          console.log(`❌ Personal Leave: Missing`);
        }
      } else {
        console.log(`❌ No leave balance structure found`);
      }
    }

    console.log('\n🎉 Raw data check completed!');

  } catch (error) {
    console.error('❌ Error checking raw data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the check
checkRawData();
