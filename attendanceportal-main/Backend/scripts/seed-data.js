// Seed script to add test employee data for dashboard
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/attendanceportal?authSource=admin';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await Employee.deleteMany({});
    console.log('Cleared existing employee data');

    // Create test employees
    const testEmployees = [
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: await bcrypt.hash('password123', 10),
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer',
        phone: '+1234567890',
        address: '123 Main St, City, State',
        domain: 'Technology',
        joinDate: new Date('2023-01-15'),
        salary: 75000,
        manager: 'Jane Smith',
        status: 'Active',
        role: 'employee',
        attendance: {
          today: {
            status: 'Present',
            checkIn: new Date(),
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: new Date(),
              status: 'Present',
              checkIn: new Date(),
              checkOut: null
            }
          ]
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: await bcrypt.hash('password123', 10),
        employeeId: 'EMP002',
        department: 'Engineering',
        position: 'Team Lead',
        phone: '+1234567891',
        address: '456 Oak St, City, State',
        domain: 'Technology',
        joinDate: new Date('2022-06-01'),
        salary: 85000,
        manager: 'Mike Johnson',
        status: 'Active',
        role: 'employee',
        attendance: {
          today: {
            status: 'Present',
            checkIn: new Date(),
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: new Date(),
              status: 'Present',
              checkIn: new Date(),
              checkOut: null
            }
          ]
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        password: await bcrypt.hash('password123', 10),
        employeeId: 'EMP003',
        department: 'Management',
        position: 'Engineering Manager',
        phone: '+1234567892',
        address: '789 Pine St, City, State',
        domain: 'Technology',
        joinDate: new Date('2021-03-15'),
        salary: 95000,
        manager: 'CEO',
        status: 'Active',
        role: 'admin',
        attendance: {
          today: {
            status: 'Present',
            checkIn: new Date(),
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: new Date(),
              status: 'Present',
              checkIn: new Date(),
              checkOut: null
            }
          ]
        }
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        password: await bcrypt.hash('password123', 10),
        employeeId: 'EMP004',
        department: 'HR',
        position: 'HR Specialist',
        phone: '+1234567893',
        address: '321 Elm St, City, State',
        domain: 'Human Resources',
        joinDate: new Date('2023-02-20'),
        salary: 65000,
        manager: 'HR Manager',
        status: 'Active',
        role: 'employee',
        attendance: {
          today: {
            status: 'Late',
            checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            checkOut: null,
            isLate: true
          },
          records: [
            {
              date: new Date(),
              status: 'Late',
              checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
              checkOut: null
            }
          ]
        }
      },
      {
        name: 'David Brown',
        email: 'david.brown@company.com',
        password: await bcrypt.hash('password123', 10),
        employeeId: 'EMP005',
        department: 'Marketing',
        position: 'Marketing Specialist',
        phone: '+1234567894',
        address: '654 Maple St, City, State',
        domain: 'Marketing',
        joinDate: new Date('2023-04-10'),
        salary: 60000,
        manager: 'Marketing Manager',
        status: 'Active',
        role: 'employee',
        attendance: {
          today: {
            status: 'Absent',
            checkIn: null,
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: new Date(),
              status: 'Absent',
              checkIn: null,
              checkOut: null
            }
          ]
        }
      }
    ];

    // Insert test employees
    const createdEmployees = await Employee.insertMany(testEmployees);
    console.log(`Created ${createdEmployees.length} test employees`);

    console.log('Database seeded successfully!');
    console.log('\nTest Employee Credentials:');
    console.log('Email: john.doe@company.com, Password: password123');
    console.log('Email: jane.smith@company.com, Password: password123');
    console.log('Email: mike.johnson@company.com, Password: password123 (Admin)');
    console.log('Email: sarah.wilson@company.com, Password: password123');
    console.log('Email: david.brown@company.com, Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
