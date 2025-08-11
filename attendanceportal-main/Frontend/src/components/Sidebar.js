import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ currentUser, onLogout, isAdmin }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/payroll', label: 'Payroll Management', icon: '💰' },
    { path: '/leave', label: 'Leave Management', icon: '📅' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const employeeMenuItems = [
    { path: '/employee-portal', label: 'My Portal', icon: '👤' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="logo">🏢 Attendance Portal</h2>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar">
          {currentUser?.name?.charAt(0) || 'U'}
        </div>
        {!isCollapsed && (
          <div className="user-details">
            <h4>{currentUser?.name || 'User'}</h4>
            <p>{isAdmin ? 'Administrator' : currentUser?.position || 'Employee'}</p>
            {!isAdmin && currentUser?.employeeId && (
              <p className="employee-id">{currentUser.employeeId}</p>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 