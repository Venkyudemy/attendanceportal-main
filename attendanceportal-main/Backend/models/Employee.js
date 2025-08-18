const mongoose = require('mongoose');

// Attendance record schema for daily attendance
const attendanceRecordSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  checkIn: {
    type: String,
    default: null
  },
  checkOut: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent', 'On Leave'],
    default: 'Absent'
  },
  hours: {
    type: Number,
    default: 0
  },
  isLate: {
    type: Boolean,
    default: false
  }
});

// Leave balance schema
const leaveBalanceSchema = new mongoose.Schema({
  annual: {
    total: { type: Number, default: 20 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 20 }
  },
  sick: {
    total: { type: Number, default: 10 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 10 }
  },
  personal: {
    total: { type: Number, default: 5 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 5 }
  }
});

// Weekly attendance summary
const weeklyAttendanceSchema = new mongoose.Schema({
  weekStart: {
    type: String,
    required: true
  },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 }
});

// Monthly attendance summary
const monthlyAttendanceSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 }
});

const attendanceSchema = new mongoose.Schema({
  today: {
    checkIn: {
      type: String,
      default: null
    },
    checkOut: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'On Leave'],
      default: 'Absent'
    },
    isLate: {
      type: Boolean,
      default: false
    }
  },
  // Historical attendance records
  records: [attendanceRecordSchema],
  // Weekly summaries
  weeklySummaries: [weeklyAttendanceSchema],
  // Monthly summaries
  monthlySummaries: [monthlyAttendanceSchema]
});

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active'
  },
  joinDate: {
    type: String,
    required: false,
    default: function() {
      // Set default to current date if not provided
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      return `${month}/${day}/${year}`;
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  domain: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  salary: {
    type: String,
    trim: true,
    default: ''
  },
  manager: {
    type: String,
    trim: true,
    default: ''
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    relationship: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // General Settings
  generalSettings: {
    companyName: {
      type: String,
      trim: true,
      default: 'TechCorp Solutions'
    },
    workingHoursStart: {
      type: String,
      trim: true,
      default: '09:00 AM'
    },
    workingHoursEnd: {
      type: String,
      trim: true,
      default: '05:00 PM'
    }
  },
  // Enhanced attendance data
  attendance: {
    type: attendanceSchema,
    default: () => ({
      today: {
        checkIn: null,
        checkOut: null,
        status: 'Absent',
        isLate: false
      },
      records: [],
      weeklySummaries: [],
      monthlySummaries: []
    })
  },
  // Leave balance
  leaveBalance: {
    type: leaveBalanceSchema,
    default: () => ({
      annual: { total: 20, used: 0, remaining: 20 },
      sick: { total: 10, used: 0, remaining: 10 },
      personal: { total: 5, used: 0, remaining: 5 }
    })
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ 'attendance.records.date': 1 });

module.exports = mongoose.model('Employee', employeeSchema); 