import React, { useState, useEffect } from 'react';
import './LeaveManagement.css';
import { getAllLeaveRequests, updateLeaveRequestStatus, deleteLeaveRequest } from '../services/api';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Load leave requests from backend
  useEffect(() => {
    const loadLeaveRequests = async () => {
      try {
        const requests = await getAllLeaveRequests();
        setLeaveRequests(requests);
      } catch (error) {
        console.error('Error loading leave requests:', error);
      }
    };

    loadLeaveRequests();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const newLeaveRequest = {
      id: Date.now(),
      ...formData,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      days
    };

    setLeaveRequests([...leaveRequests, newLeaveRequest]);
    
    setFormData({
      employeeName: '',
      employeeId: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowAddForm(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedRequest = await updateLeaveRequestStatus(id, { status: newStatus });
      setLeaveRequests(prev => 
        prev.map(request => 
          request._id === id ? updatedRequest : request
        )
      );
    } catch (error) {
      console.error('Error updating leave request status:', error);
      alert('Error updating leave request status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await deleteLeaveRequest(id);
        setLeaveRequests(prev => prev.filter(request => request._id !== id));
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert('Error deleting leave request. Please try again.');
      }
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Sick Leave': return 'danger';
      case 'Annual Leave': return 'success';
      case 'Personal Leave': return 'warning';
      case 'Maternity Leave': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="leave-management">
      <div className="page-header">
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle">Manage employee leave requests and approvals.</p>
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
          New Leave Request
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>New Leave Request</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee Name</label>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                  />
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
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
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
                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
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
                  <span className={`leave-type-badge ${getLeaveTypeColor(request.leaveType)}`}>
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
                  <span className={`status-badge ${getStatusColor(request.status)}`}>
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

export default LeaveManagement; 