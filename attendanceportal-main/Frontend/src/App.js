import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/shared/Sidebar';
import MobileMenu from './components/shared/MobileMenu';
import Dashboard from './components/shared/Dashboard';
import EmployeeManagement from './components/employee/EmployeeManagement';
import AdminPortal from './components/admin/AdminPortal';
import AdminLeaveManagement from './components/admin/AdminLeaveManagement';
import EmployeeDetails from './components/employee/EmployeeDetails';
import EditEmployee from './components/employee/EditEmployee';
import LeaveManagement from './components/shared/LeaveManagement';
import Settings from './components/shared/Settings';
import EmployeePortal from './components/employee/EmployeePortal';
import AttendanceDetails from './components/shared/AttendanceDetails';
import Profile from './components/shared/Profile';
import Login from './components/shared/Login';
import EmployeeAttendanceView from './components/employee/EmployeeAttendanceView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check for existing authentication on app startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          // For now, we'll trust the stored token and user data
          // In a production app, you might want to validate the token with the backend
          setIsAuthenticated(true);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Role-based routing
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Router>
      <MobileMenu currentUser={currentUser} onLogout={handleLogout} />
      <div className="app">
        <Sidebar currentUser={currentUser} onLogout={handleLogout} isAdmin={isAdmin} />
        <div className="main-content">
          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => window.toggleMobileMenu?.()}
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>
          <Routes>
            {isAdmin ? (
              // Admin routes
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeManagement />} />
                <Route path="/admin/:filter" element={<AdminPortal />} />
                <Route path="/admin/leave-management" element={<AdminLeaveManagement currentUser={currentUser} />} />
                <Route path="/employee/:employeeId" element={<EmployeeDetails />} />
                <Route path="/employee/:employeeId/edit" element={<EditEmployee />} />
                <Route path="/leave" element={<AdminLeaveManagement currentUser={currentUser} />} />
                <Route path="/profile" element={<Profile currentUser={currentUser} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/employee-portal" element={<Navigate to="/dashboard" replace />} />
                <Route path="/employee-attendance/:employeeId" element={<EmployeeAttendanceView />} />
              </>
            ) : (
              // Employee routes
              <>
                <Route path="/" element={<Navigate to="/employee-portal" replace />} />
                <Route path="/employee-portal" element={<EmployeePortal currentUser={currentUser} />} />
                <Route path="/attendance-details" element={<AttendanceDetails currentUser={currentUser} />} />
                <Route path="/profile" element={<Profile currentUser={currentUser} />} />
                <Route path="/dashboard" element={<Navigate to="/employee-portal" replace />} />
                <Route path="/employees" element={<Navigate to="/employee-portal" replace />} />
                <Route path="/leave" element={<AdminLeaveManagement currentUser={currentUser} />} />
                <Route path="/settings" element={<Navigate to="/employee-portal" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 