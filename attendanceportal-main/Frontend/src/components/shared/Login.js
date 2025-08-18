import React, { useState } from 'react';
import { loginUser } from '../../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const data = await loginUser(formData);
      if (data.error) {
        setError(data.message || 'Login failed');
        return;
      }
      localStorage.setItem('token', data.token);
      setError(''); // Clear error on success
      onLogin(data.user);
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if it's a connection error or authentication error
      if (err.message.includes('Failed to fetch') || err.message.includes('backend server')) {
        setError(`Connection error: ${err.message}. Please check if the backend server is running.`);
      } else if (err.isAuthError || err.message.includes('Invalid username and password') || err.message.includes('Invalid email or password') || err.message.includes('Unauthorized')) {
        setError('Invalid username and password');
      } else {
        setError('Invalid username and password');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 Attendance Portal</h1>
          <p>Welcome! Please sign in to your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn">Sign In</button>
        </form>
        
        <div className="login-footer">
          <div className="admin-info">
            <p><strong>Default Admin Login:</strong></p>
            <p>Email: admin@company.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 