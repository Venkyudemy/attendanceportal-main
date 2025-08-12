const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const employeeRoutes = require('./routes/employee');
const healthRoutes = require('./routes/health');

// CORS configuration - Allow requests from frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:80', 'http://localhost', 'http://127.0.0.1:3000', 'http://127.0.0.1:80', 'http://127.0.0.1'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Attendance Portal Backend is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_portal';

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Starting HTTP server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log('✅ MongoDB connection established');
    console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
    console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
    console.log('✅ Leave routes: /api/leave');
    console.log('✅ Health check: /api/health');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.log('Starting server without database connection...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Using mock data - MongoDB connection failed');
  });
});