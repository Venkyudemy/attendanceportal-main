// Production Configuration for Attendance Portal
// This file contains optimized settings for deployment

const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0', // Allow external connections
    cors: {
      origin: true, // Allow all origins in production
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Production optimizations
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    bcryptRounds: 12, // Increased for production
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Performance Configuration
  performance: {
    compression: true, // Enable gzip compression
    cacheControl: true, // Enable cache headers
    timeout: 30000, // 30 second timeout
    maxBodySize: '10mb' // Limit request body size
  },

  // Logging Configuration
  logging: {
    level: 'error', // Only log errors in production
    enableConsole: false, // Disable console logging
    enableFile: true // Enable file logging
  }
};

module.exports = productionConfig;
