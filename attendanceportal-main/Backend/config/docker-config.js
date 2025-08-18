module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://mongo:27017/attendanceportal',
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority'
  },
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Timezone Configuration
  timezone: process.env.TZ || 'Asia/Kolkata',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  corsMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  corsAllowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
  
  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || '/app/logs/app.log',
  
  // Health Check Configuration
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000,
  
  // Leave Management Configuration
  leaveRequestExpiryDays: parseInt(process.env.LEAVE_REQUEST_EXPIRY_DAYS) || 30,
  maxLeaveDaysPerRequest: parseInt(process.env.MAX_LEAVE_DAYS_PER_REQUEST) || 30,
  
  // Attendance Configuration
  workingHoursStart: process.env.WORKING_HOURS_START || '09:00',
  workingHoursEnd: process.env.WORKING_HOURS_END || '17:45',
  lateThresholdMinutes: parseInt(process.env.LATE_THRESHOLD_MINUTES) || 15,
  
  // API Rate Limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // limit each IP to 100 requests per windowMs
  
  // Security Configuration
  bcryptRounds: 10,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  
  // File Upload Configuration
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // Email Configuration (if needed)
  emailEnabled: false,
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT) || 587,
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || ''
};
