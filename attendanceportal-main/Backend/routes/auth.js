const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Determine role based on email or department
    let role = 'employee';
    if (email === 'admin@company.com' || user.department === 'HR') {
      role = 'admin';
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log('User login successful - Data retrieved from MongoDB:', {
      userId: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: role,
      loginTime: new Date().toISOString()
    });

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position,
      role: role
    };

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine department based on role
    let department = 'Engineering';
    if (role === 'admin') {
      department = 'HR';
    }

    // Create new user
    const newUser = new Employee({
      name,
      email,
      department,
      position: role === 'admin' ? 'System Administrator' : 'Employee',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      phone: '+1 (555) 000-0000',
      password: hashedPassword,
      attendance: {
        today: {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        }
      }
    });

    await newUser.save();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        position: newUser.position,
        role: role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed'
    });
  }
});

module.exports = router; 