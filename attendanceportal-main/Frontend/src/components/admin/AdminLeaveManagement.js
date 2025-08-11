import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLeaveManagement.css';

const AdminLeaveManagement = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveStats, setLeaveStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Approved'
  });

  // Load leave requests and employees
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [requestsResponse, employeesResponse, statsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/leave/admin'),
          fetch('http://localhost:5000/api/leave/admin/employees'),
          fetch('http://localhost:5000/api/leave/admin/stats')
        ]);

        if (requestsResponse.ok && employeesResponse.ok && statsResponse.ok) {
          const [requests, employees, stats] = await Promise.all([
            requestsResponse.json(),
            employeesResponse.json(),
            statsResponse.json()
          ]);

          setLeaveRequests(requests);
          setEmployees(employees);
          setLeaveStats(stats);
        } else {
          throw new Error('Failed to load data');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load leave management data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/leave/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newRequest = await response.json();
        setLeaveRequests([newRequest, ...leaveRequests]);
        setFormData({
          employeeId: '',
          employeeName: '',
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          status: 'Approved'
        });
        setShowAddForm(false);
        setSelectedEmployee(null);
      } else {
        throw new Error('Failed to create leave request');
      }
    } catch (error) {
      console.error('Error creating leave request:', error);
      alert('Error creating leave request. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/leave/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setLeaveRequests(prev => 
          prev.map(request => 
            request._id === id ? updatedRequest : request
          )
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating leave request status:', error);
      alert('Error updating leave request status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/leave/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setLeaveRequests(prev => prev.filter(request => request._id !== id));
        } else {
          throw new Error('Failed to delete request');
        }
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert('Error deleting leave request. Please try again.');
      }
    }
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...formData,
      employeeId: employee.employeeId,
      employeeName: employee.name
    });
    setShowEmployeeSelector(false);
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Sick Leave': return '#ef4444';
      case 'Annual Leave': return '#10b981';
      case 'Personal Leave': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  if (loading) {
    return (
      <div className="admin-leave-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leave management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-leave-management">
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
    <div className="admin-leave-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Manage employee leave requests and approvals.</p>
        </div>
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{leaveStats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{leaveStats.pendingRequests}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{leaveStats.approvedRequests}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-number">{leaveStats.rejectedRequests}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          Create Leave Request
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Leave Request</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedEmployee(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee</label>
                  <div className="employee-selector">
                    {selectedEmployee ? (
                      <div className="selected-employee">
                        <div className="employee-avatar">
                          {selectedEmployee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-info">
                          <div className="employee-name">{selectedEmployee.name}</div>
                          <div className="employee-id">{selectedEmployee.employeeId}</div>
                        </div>
                        <button 
                          type="button" 
                          className="change-employee-btn"
                          onClick={() => setShowEmployeeSelector(true)}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className="select-employee-btn"
                        onClick={() => setShowEmployeeSelector(true)}
                      >
                        Select Employee
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Days</label>
                  <div className="days-display">
                    {formData.startDate && formData.endDate ? 
                      Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 0
                    } days
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => {
                  setShowAddForm(false);
                  setSelectedEmployee(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmployeeSelector && (
        <div className="modal-overlay">
          <div className="modal employee-selector-modal">
            <div className="modal-header">
              <h3>Select Employee</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEmployeeSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="employee-list">
              {employees.map((employee) => (
                <div 
                  key={employee._id} 
                  className="employee-item"
                  onClick={() => selectEmployee(employee)}
                >
                  <div className="employee-avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <div className="employee-name">{employee.name}</div>
                    <div className="employee-details">
                      <span>{employee.employeeId}</span>
                      <span>•</span>
                      <span>{employee.department}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="leave-requests">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request._id}>
                <td>
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {request.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="employee-name">{request.employeeName}</div>
                      <div className="employee-id">{request.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="leave-type-badge"
                    style={{ backgroundColor: getLeaveTypeColor(request.leaveType) }}
                  >
                    {request.leaveType}
                  </span>
                </td>
                <td>
                  <div className="leave-duration">
                    <div>{new Date(request.startDate).toLocaleDateString()}</div>
                    <div>to</div>
                    <div>{new Date(request.endDate).toLocaleDateString()}</div>
                    <div className="days-count">({request.days} days)</div>
                  </div>
                </td>
                <td>
                  <div className="leave-reason">{request.reason}</div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </td>
                <td>{new Date(request.submittedDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    {request.status === 'Pending' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatusChange(request._id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusChange(request._id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(request._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeaveManagement;
