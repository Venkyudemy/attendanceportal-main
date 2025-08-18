const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  employeeEmail: {
    type: String,
    required: true,
    trim: true
  },
  leaveType: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    default: ''
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  adminName: {
    type: String,
    trim: true,
    default: ''
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ requestedAt: -1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema); 