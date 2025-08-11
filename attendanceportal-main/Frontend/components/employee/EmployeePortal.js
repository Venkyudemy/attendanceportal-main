import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployeePortal.css';
import { createLeaveRequest, getEmployeeLeaveRequests } from '../services/api';

const EmployeePortal = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.state?.isAdminView;
  const employeeData = location.state?.employeeData;
  const [attendanceData, setAttendanceData] = useState({
    today: {
      checkIns: [],
      checkOuts: [],
      status: 'Absent',
      totalHours: 0
    },
    thisWeek: {
      present: 0,
      absent: 0,
      late: 0,
      totalHours: 0
    },
    thisMonth: {
      present: 0,
      absent: 0,
      late: 0,
      totalHours: 0
    }
  });

  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 20, used: 0, remaining: 20 },
    sick: { total: 10, used: 0, remaining: 10 },
    personal: { total: 5, used: 0, remaining: 5 }
  });

  const [recentAttendance, setRecentAttendance] = useState([]);

  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [leaveFormData, setLeaveFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load employee portal data from database
  useEffect(() => {
    const loadEmployeePortalData = async () => {
      if (currentUser?.id || currentUser?.email) {
        try {
          // Try to find employee by email if ID doesn't work
          let employeeId = currentUser.id;
          if (!employeeId && currentUser.email) {
            const findResponse = await fetch(`http://localhost:5000/api/employee/find-by-email/${encodeURIComponent(currentUser.email)}`);
            if (findResponse.ok) {
              const employeeData = await findResponse.json();
              employeeId = employeeData._id;
              console.log('Found employee by email for portal data:', employeeId);
            }
          }
          
          if (!employeeId) {
            console.error('No employee ID found');
            return;
          }
          
          const response = await fetch(`http://localhost:5000/api/employee/${employeeId}/portal-data`);
          if (!response.ok) {
            throw new Error('Failed to fetch employee portal data');
          }
          const portalData = await response.json();
          
          // Update attendance data with real database data
          setAttendanceData({
            today: {
              checkIns: portalData.attendance.today.checkIn ? [portalData.attendance.today.checkIn] : [],
              checkOuts: portalData.attendance.today.checkOut ? [portalData.attendance.today.checkOut] : [],
              status: portalData.attendance.today.status || 'Absent',
              totalHours: portalData.attendance.today.hours || 0
            },
            thisWeek: portalData.attendance.thisWeek,
            thisMonth: portalData.attendance.thisMonth
          });

          // Update leave balance with real database data
          if (portalData.leaveBalance) {
            setLeaveBalance(portalData.leaveBalance);
          }

          // Update recent attendance with real database data
          if (portalData.attendance.recentRecords) {
            setRecentAttendance(portalData.attendance.recentRecords);
          }
        } catch (error) {
          console.error('Error loading employee portal data:', error);
        }
      }
    };

    loadEmployeePortalData();
  }, [currentUser?.id, currentUser?.email]);

  // Load employee leave requests
  useEffect(() => {
    const loadLeaveRequests = async () => {
      if (currentUser?.id) {
        try {
          const requests = await getEmployeeLeaveRequests(currentUser.id);
          setMyLeaveRequests(requests);
        } catch (error) {
          console.error('Error loading leave requests:', error);
        }
      }
    };

    loadLeaveRequests();
  }, [currentUser?.id]);

  const handleCheckIn = async () => {
    // Check if already checked in today
    if (attendanceData.today.checkIns.length > 0) {
      alert('You have already checked in today!');
      return;
    }

    try {
      console.log('Attempting check-in for user:', currentUser);
      console.log('User ID:', currentUser.id);
      console.log('User email:', currentUser.email);
      
      // Try to find employee by email if ID doesn't work
      let employeeId = currentUser.id;
      if (!employeeId) {
        // If no ID, try to find by email
        const findResponse = await fetch(`http://localhost:5000/api/employee/find-by-email/${encodeURIComponent(currentUser.email)}`);
        if (findResponse.ok) {
          const employeeData = await findResponse.json();
          employeeId = employeeData._id;
          console.log('Found employee by email:', employeeId);
        }
      }
      
      const response = await fetch(`http://localhost:5000/api/employee/${employeeId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Check-in failed:', errorData);
        throw new Error(errorData.message || 'Failed to check in');
      }

      const result = await response.json();
      
      // Update local state with the response from backend
      setAttendanceData(prev => ({
        ...prev,
        today: {
          ...prev.today,
          checkIns: [result.checkInTime],
          checkOuts: [],
          status: result.status,
          totalHours: 0
        }
      }));

      alert(`Check-in successful at ${result.checkInTime}!`);
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    // Check if not checked in today
    if (attendanceData.today.checkIns.length === 0) {
      alert('Please check in first before checking out!');
      return;
    }

    // Check if already checked out today
    if (attendanceData.today.checkOuts.length > 0) {
      alert('You have already checked out today!');
      return;
    }

    try {
      console.log('Attempting check-out for user:', currentUser);
      console.log('User ID:', currentUser.id);
      console.log('User email:', currentUser.email);
      
      // Try to find employee by email if ID doesn't work
      let employeeId = currentUser.id;
      if (!employeeId) {
        // If no ID, try to find by email
        const findResponse = await fetch(`http://localhost:5000/api/employee/find-by-email/${encodeURIComponent(currentUser.email)}`);
        if (findResponse.ok) {
          const employeeData = await findResponse.json();
          employeeId = employeeData._id;
          console.log('Found employee by email:', employeeId);
        }
      }
      
      const response = await fetch(`http://localhost:5000/api/employee/${employeeId}/check-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Check-out failed:', errorData);
        throw new Error(errorData.message || 'Failed to check out');
      }

      const result = await response.json();
      
      // Update local state with the response from backend
      setAttendanceData(prev => ({
        ...prev,
        today: {
          ...prev.today,
          checkOuts: [result.checkOutTime],
          totalHours: result.hoursWorked
        }
      }));

      alert(`Check-out successful at ${result.checkOutTime}! Hours worked: ${result.hoursWorked.toFixed(2)}`);
    } catch (error) {
      console.error('Error during check-out:', error);
      alert('Failed to check out. Please try again.');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const leaveData = {
        employeeId: currentUser?.id || 'EMP001',
        employeeName: currentUser?.name || 'Employee',
        leaveType: leaveFormData.type,
        startDate: leaveFormData.startDate,
        endDate: leaveFormData.endDate,
        reason: leaveFormData.reason
      };

      const newRequest = await createLeaveRequest(leaveData);
      setMyLeaveRequests([newRequest, ...myLeaveRequests]);
    
    setLeaveFormData({
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowLeaveForm(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setLeaveFormData({
      ...leaveFormData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="employee-portal">
      <div className="page-header">
        <h1 className="page-title">
          {isAdminView ? `${employeeData?.name || 'Employee'}'s Portal` : 'Mark Attendance'}
        </h1>
        <p className="page-subtitle">
          {isAdminView ? 'Admin View - Employee Portal' : currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {isAdminView && (
          <div className="admin-view-indicator">
            <span className="admin-badge">👑 Admin View</span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/employees')}
            >
              ← Back to Employees
            </button>
        </div>
        )}
      </div>

      <div className="attendance-card">
        <div className="current-status-section">
          <div className="status-header">
            <span className="status-icon">🕐</span>
            <h3>Current Status</h3>
          </div>
          <div className="status-content">
            <div className="status-item">
              <span className="label">Current Time</span>
              <span className="current-time-display">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="status-item">
              <span className="label">Status</span>
              <span className={`status-badge ${attendanceData.today.checkIns.length > 0 ? 'checked-in' : 'not-checked'}`}>
                {attendanceData.today.checkIns.length > 0 ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>
          </div>
        </div>

        <div className="attendance-actions-grid">
          <div className="action-box check-in-box">
            <div className="action-icon">✅</div>
            <div className="action-title">Check In</div>
            <div className="action-time">
              {attendanceData.today.checkIns.length > 0 
                ? attendanceData.today.checkIns[attendanceData.today.checkIns.length - 1]
                : 'Not checked in yet'}
            </div>
          </div>
          
          <div className="action-box check-out-box">
            <div className="action-icon">❌</div>
            <div className="action-title">Check Out</div>
            <div className="action-time">
              {attendanceData.today.checkOuts.length > 0 
                ? attendanceData.today.checkOuts[attendanceData.today.checkOuts.length - 1]
                : 'Not checked out yet'}
              </div>
          </div>
        </div>
        
        <div className="attendance-summary">
          <div className="summary-item">
            <span className="summary-label">Check Ins Today:</span>
            <span className="summary-value">{attendanceData.today.checkIns.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Check Outs Today:</span>
            <span className="summary-value">{attendanceData.today.checkOuts.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Check In:</span>
            <span className="summary-value">
              {attendanceData.today.checkIns.length > 0 
                ? attendanceData.today.checkIns[attendanceData.today.checkIns.length - 1]
                : 'None'}
            </span>
              </div>
            </div>
            
        <div className="action-buttons">
              <button 
                className="check-in-btn"
                onClick={handleCheckIn}
            disabled={attendanceData.today.checkIns.length > 0}
              >
                <div className="btn-icon">✅</div>
                <div className="btn-content">
                  <div className="btn-title">Check In</div>
              <div className="btn-subtitle">{attendanceData.today.checkIns.length > 0 ? 'Already checked in' : 'Start your shift'}</div>
                </div>
              </button>
              
              <button 
                className="check-out-btn"
                onClick={handleCheckOut}
            disabled={attendanceData.today.checkIns.length === 0 || attendanceData.today.checkOuts.length > 0}
              >
                <div className="btn-icon">🚪</div>
                <div className="btn-content">
                  <div className="btn-title">Check Out</div>
              <div className="btn-subtitle">
                {attendanceData.today.checkIns.length === 0 ? 'Check in first' : 
                 attendanceData.today.checkOuts.length > 0 ? 'Already checked out' : 'End your shift'}
              </div>
                </div>
              </button>
            </div>
            
        {attendanceData.today.checkIns.length > 0 && attendanceData.today.checkOuts.length > 0 && (
          <div className="day-complete-section">
            <div className="day-complete-btn">
              <div className="complete-icon">✅</div>
              <div className="complete-text">Day Complete!</div>
              </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisWeek.present}</div>
          <div className="stat-label">Present This Week</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisWeek.totalHours}</div>
          <div className="stat-label">Hours This Week</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisMonth.present}</div>
          <div className="stat-label">Present This Month</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisMonth.totalHours}</div>
          <div className="stat-label">Hours This Month</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="leave-balance">
          <h3>Leave Balance</h3>
          <div className="leave-cards">
            <div className="leave-card">
              <div className="leave-type">Annual Leave</div>
              <div className="leave-stats">
                <span className="remaining">{leaveBalance.annual.remaining}</span>
                <span className="separator">/</span>
                <span className="total">{leaveBalance.annual.total}</span>
              </div>
              <div className="leave-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(leaveBalance.annual.used / leaveBalance.annual.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="leave-card">
              <div className="leave-type">Sick Leave</div>
              <div className="leave-stats">
                <span className="remaining">{leaveBalance.sick.remaining}</span>
                <span className="separator">/</span>
                <span className="total">{leaveBalance.sick.total}</span>
              </div>
              <div className="leave-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(leaveBalance.sick.used / leaveBalance.sick.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="leave-card">
              <div className="leave-type">Personal Leave</div>
              <div className="leave-stats">
                <span className="remaining">{leaveBalance.personal.remaining}</span>
                <span className="separator">/</span>
                <span className="total">{leaveBalance.personal.total}</span>
              </div>
              <div className="leave-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(leaveBalance.personal.used / leaveBalance.personal.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowLeaveForm(true)}
          >
            Request Leave
          </button>
        </div>

        <div className="recent-attendance">
          <h3>Recent Attendance</h3>
          <div className="attendance-list">
            {recentAttendance.map((record, index) => (
              <div key={index} className="attendance-item">
                <div className="attendance-date">
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div className="attendance-details">
                  <div className="time-info">
                    {record.checkIn && <span>In: {record.checkIn}</span>}
                    {record.checkOut && <span>Out: {record.checkOut}</span>}
                  </div>
                  <div className="status-info">
                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    {record.hours > 0 && <span className="hours">{record.hours}h</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-leave-requests">
        <h3>My Leave Requests</h3>
        <div className="leave-requests-table">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {myLeaveRequests.map((request) => (
                <tr key={request._id}>
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
                  <td>{new Date().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLeaveForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Request Leave</h3>
              <button 
                className="close-btn"
                onClick={() => setShowLeaveForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    name="type"
                    value={leaveFormData.type}
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
                    {leaveFormData.startDate && leaveFormData.endDate ? 
                      Math.ceil((new Date(leaveFormData.endDate) - new Date(leaveFormData.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 0
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
                    value={leaveFormData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={leaveFormData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={leaveFormData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowLeaveForm(false)}>
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
    </div>
  );
};

export default EmployeePortal; 