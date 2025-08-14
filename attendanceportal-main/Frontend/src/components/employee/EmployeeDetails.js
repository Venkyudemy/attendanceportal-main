import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../../services/api';
import './EmployeeDetails.css';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching employee details for ID:', employeeId);
        
        const data = await getEmployeeById(employeeId);
        console.log('✅ Employee details received:', data);
        console.log('📊 Attendance data:', data.attendance);
        console.log('🆔 Employee ID in data:', data._id);
        setEmployee(data);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching employee details:', err);
        setError(`Failed to load employee details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

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

  const handleEditEmployee = () => {
    navigate(`/employee/${employeeId}/edit`);
  };

  const handleViewAttendanceHistory = () => {
    setShowAttendanceHistory(!showAttendanceHistory);
  };

  if (loading) {
    return (
      <div className="employee-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-details-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-details-page">
        <div className="error-container">
          <p className="error-message">Employee not found</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-details-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            {showAttendanceHistory ? 'Monthly Attendance Details' : 'Employee Details'}
          </h1>
          <p className="page-subtitle">
            {showAttendanceHistory 
              ? `Attendance history for ${employee.name}` 
              : `Complete information for ${employee.name}`
            }
          </p>
        </div>
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
      </div>

      <div className="employee-details-container">
        {!showAttendanceHistory && (
          <div className="employee-card">
            <div className="employee-header">
              <div className="employee-avatar-section">
                <div className="employee-avatar">
                  {employee.profileImage ? (
                    <img 
                      src={employee.profileImage} 
                      alt={employee.name}
                      className="profile-image"
                    />
                  ) : (
                    employee.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="employee-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(employee.attendance?.today?.status || 'Unknown') }}
                >
                  {getStatusIcon(employee.attendance?.today?.status || 'Unknown')} {employee.attendance?.today?.status || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="employee-info">
              <h2 className="employee-name">{employee.name}</h2>
              <p className="employee-email">{employee.email}</p>
              <p className="employee-position">{employee.position}</p>
              <p className="employee-department">{employee.department}</p>
            </div>

            <div className="details-grid">
              <div className="detail-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="detail-item">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value">{employee.employeeId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{employee.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Join Date:</span>
                  <span className="detail-value">{employee.joinDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Domain:</span>
                  <span className="detail-value">{employee.domain}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{employee.status}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Today's Attendance</h3>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(employee.attendance?.today?.status || 'Unknown') }}
                    >
                      {employee.attendance?.today?.status || 'Not Available'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Check-in:</span>
                  <span className="detail-value">
                    {employee.attendance?.today?.checkIn || 'Not Available'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Check-out:</span>
                  <span className="detail-value">
                    {employee.attendance?.today?.checkOut || 'Not Available'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Late Arrival:</span>
                  <span className="detail-value">{employee.attendance?.today?.isLate ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Leave Balance</h3>
                <div className="leave-balance-grid">
                  <div className="leave-type">
                    <span className="leave-label">Annual Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.annual?.remaining || 0} / {employee.leaveBalance?.annual?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Sick Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.sick?.remaining || 0} / {employee.leaveBalance?.sick?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Personal Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.personal?.remaining || 0} / {employee.leaveBalance?.personal?.total || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{employee.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Manager:</span>
                  <span className="detail-value">{employee.manager}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Salary:</span>
                  <span className="detail-value">{employee.salary}</span>
                </div>
              </div>
            </div>

            <div className="employee-actions">
              <button 
                className="btn btn-primary"
                onClick={handleEditEmployee}
              >
                Edit Employee
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleViewAttendanceHistory}
              >
                {showAttendanceHistory ? '← Back to Employee Details' : 'View Attendance History'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History View */}
      {showAttendanceHistory && (
        <div className="attendance-history-container">
          <div className="attendance-history-card">
            <div className="attendance-history-header">
              <div className="employee-info-summary">
                <div className="employee-avatar-summary">
                  {employee.profileImage ? (
                    <img 
                      src={employee.profileImage} 
                      alt={employee.name}
                      className="profile-image-summary"
                    />
                  ) : (
                    employee.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="employee-details-summary">
                  <h2 className="employee-name-summary">{employee.name}</h2>
                  <p className="employee-email-summary">{employee.email}</p>
                  <p className="employee-position-summary">{employee.position} • {employee.department}</p>
                </div>
              </div>
              <div className="attendance-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleEditEmployee}
                >
                  Edit Employee
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleViewAttendanceHistory}
                >
                  ← Back to Employee Details
                </button>
              </div>
            </div>

            <div className="attendance-summary-grid">
              <div className="summary-section">
                <h3 className="section-title">Leave Balance</h3>
                <div className="leave-balance-grid">
                  <div className="leave-type">
                    <span className="leave-label">Annual Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.annual?.remaining || 0} / {employee.leaveBalance?.annual?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Sick Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.sick?.remaining || 0} / {employee.leaveBalance?.sick?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Personal Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.personal?.remaining || 0} / {employee.leaveBalance?.personal?.total || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3 className="section-title">Today's Status</h3>
                <div className="today-status">
                  <span 
                    className="status-badge-large"
                    style={{ backgroundColor: getStatusColor(employee.attendance?.today?.status || 'Unknown') }}
                  >
                    {getStatusIcon(employee.attendance?.today?.status || 'Unknown')} {employee.attendance?.today?.status || 'Unknown'}
                  </span>
                  <div className="today-details">
                    <p><strong>Check-in:</strong> {employee.attendance?.today?.checkIn || 'Not Available'}</p>
                    <p><strong>Check-out:</strong> {employee.attendance?.today?.checkOut || 'Not Available'}</p>
                    <p><strong>Late Arrival:</strong> {employee.attendance?.today?.isLate ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
