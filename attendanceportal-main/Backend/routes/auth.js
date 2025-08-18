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
        message: 'Invalid username and password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username and password'
      });
    }

    // Use role from database or determine based on email
    let role = user.role || 'employee';
    if (email === 'admin@techcorp.com') {
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

module.exports = router; 