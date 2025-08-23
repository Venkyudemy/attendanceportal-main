// MongoDB initialization script - runs automatically when MongoDB container starts
// This script creates the admin user and initial database structure

print('🚀 MongoDB initialization starting...');

// Switch to attendanceportal database
db = db.getSiblingDB('attendanceportal');

print('📊 Using database: ' + db.getName());

// Create collections if they don't exist
db.createCollection('employees');
db.createCollection('leaveRequests');
db.createCollection('settings');

print('✅ Collections created/verified');

// Check if admin user already exists
const existingAdmin = db.employees.findOne({ email: 'admin@techcorp.com' });

if (existingAdmin) {
  print('✅ Admin user already exists');
  print('📧 Email: ' + existingAdmin.email);
  print('👤 Name: ' + existingAdmin.name);
  print('🎯 Role: ' + existingAdmin.role);
} else {
  print('👤 Creating admin user...');
  
  // Create admin user document - EXACTLY matching Employee.js schema
  const adminUser = {
    name: 'Admin User',
    email: 'admin@techcorp.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHqOe', // password123
    role: 'admin',
    department: 'Engineering', // Must match enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
    position: 'System Administrator',
    status: 'Active', // Must match enum: ['Active', 'Inactive', 'On Leave']
    phone: '+91-9876543210',
    employeeId: 'ADMIN001',
    domain: 'techcorp.com',
    address: '123 Admin Street, Tech City',
    joinDate: '01/01/2024',
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
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Insert admin user
  const result = db.employees.insertOne(adminUser);
  
  if (result.insertedId) {
    print('✅ Admin user created successfully');
    print('🆔 User ID: ' + result.insertedId);
  } else {
    print('❌ Failed to create admin user');
  }
}

// Check if sample employee exists
const existingEmployee = db.employees.findOne({ email: 'venkatesh@gmail.com' });

if (existingEmployee) {
  print('✅ Sample employee already exists');
} else {
  print('👤 Creating sample employee...');
  
  // Create sample employee - EXACTLY matching Employee.js schema
  const sampleEmployee = {
    name: 'Venkatesh',
    email: 'venkatesh@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHqOe', // venkatesh
    role: 'employee',
    department: 'Engineering', // Must match enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
    position: 'Software Developer',
    status: 'Active', // Must match enum: ['Active', 'Inactive', 'On Leave']
    phone: '+91-9876543212',
    employeeId: 'EMP001',
    domain: 'techcorp.com',
    address: '456 Employee Street, Tech City',
    joinDate: '01/01/2024',
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
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Insert sample employee
  const empResult = db.employees.insertOne(sampleEmployee);
  
  if (empResult.insertedId) {
    print('✅ Sample employee created successfully');
    print('🆔 Employee ID: ' + empResult.insertedId);
  } else {
    print('❌ Failed to create sample employee');
  }
}

// Create indexes for better performance
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ employeeId: 1 }, { unique: true });
db.employees.createIndex({ department: 1 });
db.employees.createIndex({ status: 1 });
db.employees.createIndex({ 'attendance.records.date': 1 });
db.leaveRequests.createIndex({ employeeId: 1 });
db.leaveRequests.createIndex({ status: 1 });

print('✅ Database indexes created');

// Display final summary
const totalUsers = db.employees.countDocuments();
print('📊 Total users in database: ' + totalUsers);

print('🎉 MongoDB initialization completed successfully!');
print('');
print('🔑 Login Credentials:');
print('👑 Admin: admin@techcorp.com / password123');
print('👤 Employee: venkatesh@gmail.com / venkatesh');
print('');
print('💡 You can now login to your attendance portal!');
