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

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Attendance Portal Backend is running with MongoDB');
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
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('✅ MongoDB connection established');
    console.log('✅ Auth routes: /api/auth/login, /api/auth/register');
    console.log('✅ Employee routes: /api/employee/stats, /api/employee/attendance');
    console.log('✅ Leave routes: /api/leave');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.log('Starting server without database connection...');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Using mock data - MongoDB connection failed');
  });
});