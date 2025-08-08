const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_portal';

const seedEmployees = [
  {
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'Active',
    joinDate: '2023-01-15',
    phone: '+1 (555) 123-4567',
    employeeId: 'EMP001',
    domain: 'Web Development',
    address: '123 Main St, City, State',
    salary: '$85,000',
    manager: 'Jane Manager',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 111-2222',
      address: '123 Main St, City, State'
    },
    attendance: {
      today: {
        checkIn: '09:15 AM',
        checkOut: null,
        status: 'Present',
        isLate: false
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: '09:15 AM',
          checkOut: '05:30 PM',
          status: 'Present',
          hours: 8.25,
          isLate: false
        },
        {
          date: '2024-01-14',
          checkIn: '09:45 AM',
          checkOut: '05:30 PM',
          status: 'Late',
          hours: 7.75,
          isLate: true
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 4,
          absent: 1,
          late: 1,
          totalHours: 32
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 18,
          absent: 2,
          late: 3,
          totalHours: 144
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
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    status: 'Active',
    joinDate: '2022-08-20',
    phone: '+1 (555) 234-5678',
    employeeId: 'EMP002',
    domain: 'Digital Marketing',
    address: '456 Oak Ave, City, State',
    salary: '$75,000',
    manager: 'Mike Director',
    emergencyContact: {
      name: 'Tom Johnson',
      relationship: 'Spouse',
      phone: '+1 (555) 222-3333',
      address: '456 Oak Ave, City, State'
    },
    attendance: {
      today: {
        checkIn: '10:30 AM',
        checkOut: null,
        status: 'Late',
        isLate: true
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: '09:45 AM',
          checkOut: null,
          status: 'Late',
          hours: 0,
          isLate: true
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 3,
          absent: 1,
          late: 2,
          totalHours: 24
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 15,
          absent: 3,
          late: 5,
          totalHours: 120
        }
      ]
    },
    leaveBalance: {
      annual: { total: 20, used: 3, remaining: 17 },
      sick: { total: 10, used: 1, remaining: 9 },
      personal: { total: 5, used: 0, remaining: 5 }
    }
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'Sales',
    position: 'Sales Representative',
    status: 'Active',
    joinDate: '2023-03-10',
    phone: '+1 (555) 345-6789',
    employeeId: 'EMP003',
    domain: 'B2B Sales',
    address: '789 Pine St, City, State',
    salary: '$65,000',
    manager: 'Sarah Sales',
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Spouse',
      phone: '+1 (555) 333-4444',
      address: '789 Pine St, City, State'
    },
    attendance: {
      today: {
        checkIn: '08:45 AM',
        checkOut: null,
        status: 'Present',
        isLate: false
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: '08:45 AM',
          checkOut: '05:30 PM',
          status: 'Present',
          hours: 8.5,
          isLate: false
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 5,
          absent: 0,
          late: 0,
          totalHours: 40
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 20,
          absent: 0,
          late: 1,
          totalHours: 160
        }
      ]
    },
    leaveBalance: {
      annual: { total: 20, used: 2, remaining: 18 },
      sick: { total: 10, used: 0, remaining: 10 },
      personal: { total: 5, used: 1, remaining: 4 }
    }
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'HR',
    position: 'HR Specialist',
    status: 'On Leave',
    joinDate: '2022-11-05',
    phone: '+1 (555) 456-7890',
    employeeId: 'EMP004',
    domain: 'Human Resources',
    address: '321 Elm St, City, State',
    salary: '$70,000',
    manager: 'HR Director',
    emergencyContact: {
      name: 'Robert Davis',
      relationship: 'Spouse',
      phone: '+1 (555) 444-5555',
      address: '321 Elm St, City, State'
    },
    attendance: {
      today: {
        checkIn: null,
        checkOut: null,
        status: 'On Leave',
        isLate: false
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: null,
          checkOut: null,
          status: 'On Leave',
          hours: 0,
          isLate: false
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 0,
          absent: 0,
          late: 0,
          totalHours: 0
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 0,
          absent: 0,
          late: 0,
          totalHours: 0
        }
      ]
    },
    leaveBalance: {
      annual: { total: 20, used: 8, remaining: 12 },
      sick: { total: 10, used: 3, remaining: 7 },
      personal: { total: 5, used: 2, remaining: 3 }
    }
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    department: 'Engineering',
    position: 'Junior Developer',
    status: 'Active',
    joinDate: '2023-06-01',
    phone: '+1 (555) 567-8901',
    employeeId: 'EMP005',
    domain: 'Mobile Development',
    address: '654 Maple Dr, City, State',
    salary: '$60,000',
    manager: 'John Doe',
    emergencyContact: {
      name: 'Mary Wilson',
      relationship: 'Spouse',
      phone: '+1 (555) 555-6666',
      address: '654 Maple Dr, City, State'
    },
    attendance: {
      today: {
        checkIn: null,
        checkOut: null,
        status: 'Absent',
        isLate: false
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          hours: 0,
          isLate: false
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 2,
          absent: 3,
          late: 0,
          totalHours: 16
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 12,
          absent: 8,
          late: 1,
          totalHours: 96
        }
      ]
    },
    leaveBalance: {
      annual: { total: 20, used: 1, remaining: 19 },
      sick: { total: 10, used: 0, remaining: 10 },
      personal: { total: 5, used: 0, remaining: 5 }
    }
  },
  {
    name: 'venkatesh',
    email: 'venkatesh@gmail.com',
    department: 'Engineering',
    position: 'junior',
    status: 'Active',
    joinDate: '2023-07-15',
    phone: '012345678906',
    employeeId: 'EMP006',
    domain: 'Software Development',
    address: '789 Tech Street, Bangalore, India',
    salary: '$55,000',
    manager: 'John Doe',
    emergencyContact: {
      name: 'Priya Venkatesh',
      relationship: 'Spouse',
      phone: '+91 9876543210',
      address: '789 Tech Street, Bangalore, India'
    },
    attendance: {
      today: {
        checkIn: null,
        checkOut: null,
        status: 'Absent',
        isLate: false
      },
      records: [
        {
          date: '2024-01-15',
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          hours: 0,
          isLate: false
        }
      ],
      weeklySummaries: [
        {
          weekStart: '2024-01-15',
          present: 3,
          absent: 2,
          late: 0,
          totalHours: 24
        }
      ],
      monthlySummaries: [
        {
          month: '2024-01',
          present: 16,
          absent: 4,
          late: 1,
          totalHours: 128
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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    console.log('Cleared existing employee data');

    // Hash passwords and create employees
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const employeesWithPasswords = seedEmployees.map(emp => ({
      ...emp,
      password: hashedPassword
    }));

    // Insert seed data
    const result = await Employee.insertMany(employeesWithPasswords);
    console.log(`Seeded ${result.length} employees successfully`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 