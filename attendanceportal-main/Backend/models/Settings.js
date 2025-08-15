const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  companyName: {
    type: String,
    default: 'TechCorp Solutions',
    trim: true
  },
  workingHoursStart: {
    type: String,
    default: '09:00 AM',
    trim: true
  },
  workingHoursEnd: {
    type: String,
    default: '05:00 PM',
    trim: true
  },
  
  // Attendance Rules
  lateThreshold: {
    type: Number,
    default: 15, // minutes
    min: 0,
    max: 120
  },
  overtimeThreshold: {
    type: Number,
    default: 8, // hours
    min: 6,
    max: 12
  },
  
  // Leave Management
  leaveTypes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    days: {
      type: Number,
      default: 0,
      min: 0
    },
    color: {
      type: String,
      default: '#007bff'
    }
  }],
  
  // Company Holidays
  companyHolidays: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['public', 'company'],
      default: 'company'
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Notifications
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Appearance
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
