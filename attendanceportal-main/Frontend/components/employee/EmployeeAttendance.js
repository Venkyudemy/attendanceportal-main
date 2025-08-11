import React, { useState, useEffect } from 'react';
import './EmployeeAttendance.css';

const EmployeeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/employee/attendance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }
        
        const data = await response.json();
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchEmployees, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'On Leave': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return '✅';
      case 'Late': return '⏰';
      case 'Absent': return '❌';
      case 'On Leave': return '🏖️';
      default: return '❓';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || employee.attendance.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="employee-attendance">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-attendance">
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
    <div className="employee-attendance">
      <div className="page-header">
        <h1 className="page-title">Employee Attendance</h1>
        <p className="page-subtitle">
          Real-time attendance status of all employees
        </p>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="attendance-grid">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-header">
              <div className="employee-avatar">
                {employee.name.charAt(0)}
              </div>
              <div className="employee-info">
                <h3 className="employee-name">{employee.name}</h3>
                <p className="employee-position">{employee.position}</p>
                <p className="employee-department">{employee.department}</p>
              </div>
              <div className={`status-badge ${getStatusColor(employee.attendance.status)}`}>
                <span className="status-icon">{getStatusIcon(employee.attendance.status)}</span>
                {employee.attendance.status}
              </div>
            </div>
            
            <div className="attendance-details">
              <div className="detail-item">
                <span className="detail-label">Check In:</span>
                <span className="detail-value">
                  {employee.attendance.checkIn || 'Not checked in'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check Out:</span>
                <span className="detail-value">
                  {employee.attendance.checkOut || 'Not checked out'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{employee.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{employee.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="no-results">
          <p>No employees found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance; 