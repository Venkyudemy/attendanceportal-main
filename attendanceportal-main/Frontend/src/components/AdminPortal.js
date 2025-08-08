import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminPortal.css';

const AdminPortal = () => {
  const { filter } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filterConfig = {
    total: {
      title: 'All Employees',
      endpoint: '/api/employee/admin/total',
      color: '#6366f1'
    },
    present: {
      title: 'Present Employees',
      endpoint: '/api/employee/admin/present',
      color: '#10b981'
    },
    late: {
      title: 'Late Arrivals',
      endpoint: '/api/employee/admin/late',
      color: '#f59e0b'
    },
    absent: {
      title: 'Absent Employees',
      endpoint: '/api/employee/admin/absent',
      color: '#ef4444'
    },
    leave: {
      title: 'Employees on Leave',
      endpoint: '/api/employee/admin/leave',
      color: '#8b5cf6'
    },
    'high-attendance': {
      title: 'High Attendance Employees',
      endpoint: '/api/employee/admin/high-attendance',
      color: '#06b6d4'
    }
  };

  const currentFilter = filterConfig[filter] || filterConfig.total;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000${currentFilter.endpoint}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        
        const data = await response.json();
        setEmployees(data.employees);
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [filter, currentFilter.endpoint]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return '#10b981';
      case 'Late':
        return '#f59e0b';
      case 'Absent':
        return '#ef4444';
      case 'On Leave':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return '✅';
      case 'Late':
        return '⏰';
      case 'Absent':
        return '❌';
      case 'On Leave':
        return '🏖️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="admin-portal">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-portal">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      <div className="portal-header">
        <div className="header-content">
          <h1 className="portal-title" style={{ color: currentFilter.color }}>
            {currentFilter.title}
          </h1>
          <p className="portal-subtitle">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search employees by name, email, department, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="filter-tabs">
        {Object.entries(filterConfig).map(([key, config]) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? 'active' : ''}`}
            style={{ 
              borderColor: filter === key ? config.color : 'transparent',
              color: filter === key ? config.color : '#6b7280'
            }}
            onClick={() => navigate(`/admin/${key}`)}
          >
            {config.title}
          </button>
        ))}
      </div>

      <div className="employees-grid">
        {filteredEmployees.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">👥</div>
            <h3>No employees found</h3>
            <p>
              {searchTerm 
                ? `No employees match "${searchTerm}"`
                : `No ${currentFilter.title.toLowerCase()} found`
              }
            </p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="employee-card">
              <div className="employee-header">
                <div className="employee-avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="employee-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(employee.attendance.status) }}
                  >
                    {getStatusIcon(employee.attendance.status)} {employee.attendance.status}
                  </span>
                </div>
              </div>
              
              <div className="employee-info">
                <h3 className="employee-name">{employee.name}</h3>
                <p className="employee-email">{employee.email}</p>
                <p className="employee-position">{employee.position}</p>
                <p className="employee-department">{employee.department}</p>
              </div>

              <div className="employee-details">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{employee.employeeId}</span>
                </div>
                {employee.attendance.checkIn && (
                  <div className="detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">{employee.attendance.checkIn}</span>
                  </div>
                )}
                {employee.attendance.checkOut && (
                  <div className="detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">{employee.attendance.checkOut}</span>
                  </div>
                )}
                {employee.attendance.isLate && (
                  <div className="detail-item">
                    <span className="detail-label">Late:</span>
                    <span className="detail-value">Yes</span>
                  </div>
                )}
              </div>

              <div className="employee-actions">
                <button 
                  className="btn btn-primary action-btn"
                  onClick={() => navigate(`/employee/${employee.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
