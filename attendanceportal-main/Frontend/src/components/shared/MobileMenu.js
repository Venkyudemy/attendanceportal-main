import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Expose toggle function globally for external control
  React.useEffect(() => {
    window.toggleMobileMenu = () => setIsOpen(!isOpen);
    return () => {
      delete window.toggleMobileMenu;
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/attendance',
      label: 'Attendance',
      icon: '📅'
    },
    {
      path: '/leave',
      label: 'Leave Management',
      icon: '🏖️'
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: '👤'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="mobile-menu">
      {/* Hamburger Button */}
      <button className="mobile-menu-toggle" onClick={toggleMenu}>
        <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      {/* Mobile Menu Content */}
      <div className={`mobile-menu-content ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="mobile-user-details">
              <h4>{currentUser?.name || 'User'}</h4>
              <p>{currentUser?.email || 'user@example.com'}</p>
              <span className="mobile-employee-id">
                ID: {currentUser?.employeeId || 'N/A'}
              </span>
            </div>
          </div>
          <button className="mobile-menu-close" onClick={closeMenu}>
            ✕
          </button>
        </div>

        <nav className="mobile-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <button className="mobile-logout-btn" onClick={onLogout}>
            <span className="mobile-logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
