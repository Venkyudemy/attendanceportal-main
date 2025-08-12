// Seed script to add test employee data for dashboard
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

// Helper function to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toLocaleDateString('en-CA');
}

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

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const weekStart = getWeekStart(today);
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Create test employees with proper attendance structure
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
            checkIn: '09:00 AM',
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: todayStr,
              status: 'Present',
              checkIn: '09:00 AM',
              checkOut: null,
              hours: 0,
              isLate: false
            }
          ],
          weeklySummaries: [
            {
              weekStart: weekStart,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ],
          monthlySummaries: [
            {
              month: monthKey,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ]
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
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
            checkIn: '08:45 AM',
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: todayStr,
              status: 'Present',
              checkIn: '08:45 AM',
              checkOut: null,
              hours: 0,
              isLate: false
            }
          ],
          weeklySummaries: [
            {
              weekStart: weekStart,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ],
          monthlySummaries: [
            {
              month: monthKey,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ]
        },
        leaveBalance: {
          annual: { total: 20, used: 2, remaining: 18 },
          sick: { total: 10, used: 1, remaining: 9 },
          personal: { total: 5, used: 0, remaining: 5 }
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
            checkIn: '08:30 AM',
            checkOut: null,
            isLate: false
          },
          records: [
            {
              date: todayStr,
              status: 'Present',
              checkIn: '08:30 AM',
              checkOut: null,
              hours: 0,
              isLate: false
            }
          ],
          weeklySummaries: [
            {
              weekStart: weekStart,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ],
          monthlySummaries: [
            {
              month: monthKey,
              present: 1,
              absent: 0,
              late: 0,
              totalHours: 0
            }
          ]
        },
        leaveBalance: {
          annual: { total: 20, used: 5, remaining: 15 },
          sick: { total: 10, used: 2, remaining: 8 },
          personal: { total: 5, used: 1, remaining: 4 }
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
            checkIn: '10:15 AM',
            checkOut: null,
            isLate: true
          },
          records: [
            {
              date: todayStr,
              status: 'Late',
              checkIn: '10:15 AM',
              checkOut: null,
              hours: 0,
              isLate: true
            }
          ],
          weeklySummaries: [
            {
              weekStart: weekStart,
              present: 0,
              absent: 0,
              late: 1,
              totalHours: 0
            }
          ],
          monthlySummaries: [
            {
              month: monthKey,
              present: 0,
              absent: 0,
              late: 1,
              totalHours: 0
            }
          ]
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
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
              date: todayStr,
              status: 'Absent',
              checkIn: null,
              checkOut: null,
              hours: 0,
              isLate: false
            }
          ],
          weeklySummaries: [
            {
              weekStart: weekStart,
              present: 0,
              absent: 1,
              late: 0,
              totalHours: 0
            }
          ],
          monthlySummaries: [
            {
              month: monthKey,
              present: 0,
              absent: 1,
              late: 0,
              totalHours: 0
            }
          ]
        },
        leaveBalance: {
          annual: { total: 20, used: 0, remaining: 20 },
          sick: { total: 10, used: 0, remaining: 10 },
          personal: { total: 5, used: 0, remaining: 5 }
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
