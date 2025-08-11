import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegisterSuccess(''); // Clear registration success on login attempt
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      localStorage.setItem('token', data.token);
      setError(''); // Clear error on success
      onLogin(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(`Connection error: ${err.message}. Please check if the backend server is running on http://localhost:5000`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setError(''); // Clear login error on registration attempt
    if (!registerData.name || !registerData.email || !registerData.password) {
      setRegisterError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      if (!response.ok) {
        setRegisterError(data.message || 'Registration failed');
        return;
      }
      setRegisterSuccess('Registration successful! You can now log in.');
      setRegisterError('');
      setShowRegister(false);
      setFormData({ email: registerData.email, password: '' });
    } catch (err) {
      setRegisterError('Server error. Please try again later.');
    }
  };

  // Clear errors/success when toggling forms
  const handleShowRegister = () => {
    setShowRegister(true);
    setError('');
    setRegisterError('');
    setRegisterSuccess('');
  };
  const handleShowLogin = () => {
    setShowRegister(false);
    setError('');
    setRegisterError('');
    setRegisterSuccess('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 Attendance Portal</h1>
          <p>Welcome! Please sign in to your account.</p>
        </div>
        {showRegister ? (
          <form onSubmit={handleRegister} className="login-form">
            {registerError && <div className="error-message">{registerError}</div>}
            {registerSuccess && <div className="success-message">{registerSuccess}</div>}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                type="email"
                id="register-email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                type="password"
                id="register-password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="login-btn">Register</button>
            <div className="login-footer">
              <span>Already have an account?{' '}
                <button type="button" className="link-btn" onClick={handleShowLogin}>
                  Login here
                </button>
              </span>
            </div>
          </form>
        ) : (
          <>
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
              <span>Don't have an account?{' '}
                <button type="button" className="link-btn" onClick={handleShowRegister}>
                  Register here
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login; 