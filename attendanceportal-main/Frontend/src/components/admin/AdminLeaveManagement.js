import React, { useState, useEffect } from 'react';
import { getAllLeaveRequests, updateLeaveRequestStatus, getLeaveRequestStats } from '../../services/api';
import './AdminLeaveManagement.css';

const AdminLeaveManagement = ({ currentUser }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    status: '',
    adminResponse: ''
  });

  useEffect(() => {
    loadLeaveRequests();
    loadStats();
  }, []);

  const loadLeaveRequests = async () => {
      try {
        setLoading(true);
      const requests = await getAllLeaveRequests();
      setLeaveRequests(requests || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

  const loadStats = async () => {
    try {
      const statsData = await getLeaveRequestStats();
      setStats(statsData || { pending: 0, approved: 0, rejected: 0, total: 0 });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !responseData.status) return;

    try {
      await updateLeaveRequestStatus(selectedRequest._id, {
        status: responseData.status,
        adminResponse: responseData.adminResponse,
        adminId: currentUser?.id || currentUser?._id,
        adminName: currentUser?.name
      });

      // Reload data
      await loadLeaveRequests();
      await loadStats();
      
      setShowResponseModal(false);
      setSelectedRequest(null);
      setResponseData({ status: '', adminResponse: '' });
      
      alert('Leave request status updated successfully!');
    } catch (error) {
      console.error('Error updating leave request status:', error);
      alert('Failed to update leave request status. Please try again.');
    }
  };

  const openResponseModal = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Approved': return '#28a745';
      case 'Rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="admin-leave-management">
        <div className="loading">Loading leave requests...</div>
      </div>
    );
  }

  return (
    <div className="admin-leave-management">
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Manage employee leave requests and approvals</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
        </button>
              <button 
            className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilter('Pending')}
          >
            Pending ({stats.pending})
              </button>
                        <button 
            className={`filter-btn ${filter === 'Approved' ? 'active' : ''}`}
            onClick={() => setFilter('Approved')}
                        >
            Approved ({stats.approved})
                        </button>
                      <button 
            className={`filter-btn ${filter === 'Rejected' ? 'active' : ''}`}
            onClick={() => setFilter('Rejected')}
          >
            Rejected ({stats.rejected})
                </button>
          </div>
        </div>

      {/* Leave Requests Table */}
      <div className="leave-requests-container">
        <div className="table-container">
          <table className="leave-requests-table">
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
              <tr key={request._id}>
                <td>
                  <div className="employee-info">
                      <div className="employee-name">{request.employeeName}</div>
                        <div className="employee-email">{request.employeeEmail}</div>
                  </div>
                </td>
                <td>
                      <span className="leave-type-badge">
                    {request.leaveType}
                  </span>
                </td>
                <td>
                  <div className="leave-duration">
                    <div>{new Date(request.startDate).toLocaleDateString()}</div>
                    <div>to</div>
                    <div>{new Date(request.endDate).toLocaleDateString()}</div>
                        <div className="days-count">({request.totalDays} days)</div>
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
                    <td>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                <td>
                      {request.status === 'Pending' && (
                  <div className="action-buttons">
                        <button 
                          className="btn btn-success btn-sm"
                            onClick={() => {
                              setResponseData({ status: 'Approved', adminResponse: '' });
                              openResponseModal(request);
                            }}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                            onClick={() => {
                              setResponseData({ status: 'Rejected', adminResponse: '' });
                              openResponseModal(request);
                            }}
                        >
                          Reject
                        </button>
                        </div>
                      )}
                      {request.status !== 'Pending' && (
                        <div className="response-info">
                          {request.adminResponse && (
                            <div className="admin-response">
                              <strong>Response:</strong> {request.adminResponse}
                            </div>
                          )}
                          {request.adminName && (
                            <div className="admin-name">
                              By: {request.adminName}
                            </div>
                          )}
                  </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-requests">
                    <p>No leave requests found.</p>
                </td>
              </tr>
              )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Leave Request Status</h3>
              <button 
                className="close-btn"
                onClick={() => setShowResponseModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="request-summary">
                <h4>Request Summary</h4>
                <p><strong>Employee:</strong> {selectedRequest.employeeName}</p>
                <p><strong>Leave Type:</strong> {selectedRequest.leaveType}</p>
                <p><strong>Duration:</strong> {selectedRequest.totalDays} days</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={responseData.status}
                  onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Select Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Response (Optional)</label>
                <textarea
                  value={responseData.adminResponse}
                  onChange={(e) => setResponseData(prev => ({ ...prev, adminResponse: e.target.value }))}
                  placeholder="Add a response or comment..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={!responseData.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;
