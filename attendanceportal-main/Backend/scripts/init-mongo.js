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
  
  // Create admin user document
  const adminUser = {
    name: 'Admin User',
    email: 'admin@techcorp.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHqOe', // password123
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
      casual: 12,
      sick: 12,
      earned: 15,
      maternity: 180,
      paternity: 15,
      unpaid: 30
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
  
  // Create sample employee
  const sampleEmployee = {
    name: 'Venkatesh',
    email: 'venkatesh@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHqOe', // venkatesh
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
      casual: 12,
      sick: 12,
      earned: 15,
      maternity: 180,
      paternity: 15,
      unpaid: 30
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
