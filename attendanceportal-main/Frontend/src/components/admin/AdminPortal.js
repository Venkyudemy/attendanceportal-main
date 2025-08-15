import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getAdminTotalEmployees, 
  getAdminPresentEmployees, 
  getAdminLateEmployees, 
  getAdminAbsentEmployees, 
  getAdminEmployeesOnLeave,
  calculatePayroll,
  exportPayroll
} from '../../services/api';
import './AdminPortal.css';

const AdminPortal = () => {
  const { filter } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payrollData, setPayrollData] = useState(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollPeriod, setPayrollPeriod] = useState({ startDate: '', endDate: '' });

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
    },
    payroll: {
      title: 'Payroll Calculation',
      endpoint: null,
      color: '#ec4899'
    }
  };

  const currentFilter = filterConfig[filter] || filterConfig.total;

  useEffect(() => {
    if (filter === 'payroll') {
      // Don't fetch employee data for payroll view
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        let data;
        
        switch (filter) {
          case 'total':
            data = await getAdminTotalEmployees();
            break;
          case 'present':
            data = await getAdminPresentEmployees();
            break;
          case 'late':
            data = await getAdminLateEmployees();
            break;
          case 'absent':
            data = await getAdminAbsentEmployees();
            break;
          case 'leave':
            data = await getAdminEmployeesOnLeave();
            break;
          default:
            data = await getAdminTotalEmployees();
        }
        
        setEmployees(data.employees || []);
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

  const fetchPayrollData = async () => {
    try {
      setPayrollLoading(true);
      const queryParams = new URLSearchParams();
      if (payrollPeriod.startDate) queryParams.append('startDate', payrollPeriod.startDate);
      if (payrollPeriod.endDate) queryParams.append('endDate', payrollPeriod.endDate);
      
      const data = await calculatePayroll(queryParams.toString());
      setPayrollData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setError('Failed to load payroll data');
    } finally {
      setPayrollLoading(false);
    }
  };

  const exportPayrollData = async (format = 'csv') => {
    try {
      setError(null); // Clear any previous errors
      
      // If we have payroll data, use it directly for export
      if (payrollData && payrollData.payrollData) {
        console.log('📊 Using existing payroll data for export');
        exportPayrollToCSV(payrollData.payrollData);
        return;
      }
      
      const queryParams = new URLSearchParams();
      if (payrollPeriod.startDate) queryParams.append('startDate', payrollPeriod.startDate);
      if (payrollPeriod.endDate) queryParams.append('endDate', payrollPeriod.endDate);
      queryParams.append('format', format);
      
      console.log('🔄 Exporting payroll data with params:', queryParams.toString());
      
      const csvContent = await exportPayroll(queryParams.toString());
      
      if (format === 'csv' && csvContent) {
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll_${payrollPeriod.startDate || 'default'}_${payrollPeriod.endDate || 'period'}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Payroll CSV exported successfully');
      } else {
        throw new Error('No CSV content received');
      }
    } catch (err) {
      console.error('❌ Error exporting payroll data:', err);
      setError('Failed to export payroll data. Please try again.');
    }
  };

  // Fallback function to export payroll data to CSV
  const exportPayrollToCSV = (payrollData) => {
    try {
      // CSV headers
      const headers = [
        'Employee Name',
        'Email', 
        'Department',
        'Monthly Salary',
        'Full Days',
        'Late Days',
        'Absents',
        'Leave Days',
        'LOP Amount',
        'Final Pay'
      ].join(',');

      // CSV rows
      const rows = payrollData.map(emp => [
        `"${emp.name || ''}"`,
        `"${emp.email || ''}"`,
        `"${emp.department || ''}"`,
        emp.monthlySalary || 0,
        emp.fullDays || 0,
        emp.lateDays || 0,
        emp.absents || 0,
        emp.leaveDays || 0,
        emp.lopAmount || 0,
        emp.finalPay || 0
      ].join(','));

      const csvContent = headers + '\n' + rows.join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Payroll CSV exported successfully using fallback method');
    } catch (err) {
      console.error('❌ Error in fallback CSV export:', err);
      setError('Failed to export payroll data. Please try again.');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayrollData = payrollData?.payrollData?.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  // Render payroll view
  if (filter === 'payroll') {
    return (
      <div className="admin-portal">
        <div className="portal-header">
          <div className="header-content">
            <h1 className="portal-title" style={{ color: currentFilter.color }}>
              {currentFilter.title}
            </h1>
            <p className="portal-subtitle">
              Calculate and manage employee payroll
            </p>
          </div>
          <button 
            className="btn btn-secondary back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="payroll-controls">
          <div className="date-filters">
            <div className="date-input-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={payrollPeriod.startDate}
                onChange={(e) => setPayrollPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={payrollPeriod.endDate}
                onChange={(e) => setPayrollPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                className="date-input"
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={fetchPayrollData}
              disabled={payrollLoading}
            >
              {payrollLoading ? 'Calculating...' : 'Calculate Payroll'}
            </button>
          </div>
          
          {payrollData && (
            <div className="export-controls">
              <button 
                className="btn btn-secondary"
                onClick={() => exportPayrollData('csv')}
              >
                Export to Excel (CSV)
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message-container">
            <div className="error-message">
              {error}
            </div>
            <button 
              className="btn btn-primary retry-btn"
              onClick={() => setError(null)}
            >
              Retry
            </button>
          </div>
        )}

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

        {payrollData && (
          <div className="payroll-summary">
            <div className="summary-info">
              <h3>Payroll Summary</h3>
              <div className="summary-details">
                <span><strong>Period:</strong> {new Date(payrollData.payrollPeriod.startDate).toLocaleDateString()} - {new Date(payrollData.payrollPeriod.endDate).toLocaleDateString()}</span>
                <span><strong>Total Working Days:</strong> {payrollData.totalWorkingDays}</span>
                <span><strong>Late Penalty:</strong> ₹{payrollData.fixedLatePenalty} per day</span>
              </div>
            </div>
          </div>
        )}

        {payrollData ? (
          <div className="payroll-table-container">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Monthly Salary</th>
                  <th>Full Days</th>
                  <th>Late Days</th>
                  <th>Absents</th>
                  <th>Leave Days</th>
                  <th>LOP Amount</th>
                  <th>Final Pay</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrollData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      {searchTerm ? `No employees match "${searchTerm}"` : 'No payroll data available'}
                    </td>
                  </tr>
                ) : (
                  filteredPayrollData.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td>
                        <div className="employee-name-cell">
                          <div className="employee-avatar-small">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="employee-name">{emp.name}</div>
                            <div className="employee-email">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td>₹{emp.monthlySalary.toLocaleString()}</td>
                      <td className="full-days">{emp.fullDays}</td>
                      <td className="late-days">{emp.lateDays}</td>
                      <td className="absent-days">{emp.absents}</td>
                      <td className="leave-days">{emp.leaveDays}</td>
                      <td className="lop-amount">₹{emp.lopAmount.toLocaleString()}</td>
                      <td className="final-pay">₹{emp.finalPay.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="payroll-placeholder">
            <div className="placeholder-icon">💰</div>
            <h3>Payroll Calculation</h3>
            <p>Select a date range and click "Calculate Payroll" to generate payroll data for all employees.</p>
            <p className="note">Note: Payroll cycle runs from the 23rd of the current month to the 23rd of the next month.</p>
          </div>
        )}
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
