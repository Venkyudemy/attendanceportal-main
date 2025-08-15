import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployeePortal.css';
import { 
  createLeaveRequest, 
  getEmployeeLeaveRequests, 
  findEmployeeByEmail, 
  getEmployeePortalData,
  checkInEmployee,
  checkOutEmployee,
  getLeaveTypes,
  getTodayHoliday
} from '../../services/api';
import LeaveRequestForm from './LeaveRequestForm';

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

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [todayHoliday, setTodayHoliday] = useState(null);

  const [leaveFormData, setLeaveFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // Use consistent timezone handling
      const now = new Date();
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time consistently with backend
  const formatTime = (date) => {
    // Use the same timezone as backend (Asia/Kolkata)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  // Load employee portal data from database
    const loadEmployeePortalData = async () => {
    if (currentUser?.id || currentUser?._id || currentUser?.email) {
        try {
          // Try to find employee by email if ID doesn't work
        let employeeId = currentUser.id || currentUser._id;
          if (!employeeId && currentUser.email) {
            const employeeData = await findEmployeeByEmail(currentUser.email);
            if (employeeData && employeeData._id) {
              employeeId = employeeData._id;
              console.log('Found employee by email for portal data:', employeeId);
            } else {
              console.error('Employee not found by email:', currentUser.email);
              return;
            }
          }
          
          if (!employeeId) {
            console.error('No employee ID found');
            return;
          }
          
        // Fetch leave types from global settings
        const leaveTypesData = await getLeaveTypes();
        if (leaveTypesData && leaveTypesData.leaveTypes) {
          setLeaveTypes(leaveTypesData.leaveTypes);
          
          // Update leave balance based on global settings
          const updatedLeaveBalance = {};
          leaveTypesData.leaveTypes.forEach(type => {
            const typeKey = type.name.toLowerCase().replace(/\s+/g, '');
            updatedLeaveBalance[typeKey] = {
              total: type.days,
              used: 0, // This will be calculated from leave requests
              remaining: type.days
            };
          });
          setLeaveBalance(updatedLeaveBalance);
        }

        // Fetch employee portal data
        const portalData = await getEmployeePortalData(employeeId);
        if (portalData) {
          setAttendanceData(prev => ({
            ...prev,
            ...portalData.attendance,
            today: {
              checkIns: portalData.attendance?.today?.checkIns || [],
              checkOuts: portalData.attendance?.today?.checkOuts || [],
              status: portalData.attendance?.today?.status || 'Absent',
              totalHours: portalData.attendance?.today?.totalHours || 0
            },
            thisWeek: {
              present: portalData.attendance?.thisWeek?.present || 0,
              absent: portalData.attendance?.thisWeek?.absent || 0,
              late: portalData.attendance?.thisWeek?.late || 0,
              totalHours: portalData.attendance?.thisWeek?.totalHours || 0
            },
            thisMonth: {
              present: portalData.attendance?.thisMonth?.present || 0,
              absent: portalData.attendance?.thisMonth?.absent || 0,
              late: portalData.attendance?.thisMonth?.late || 0,
              totalHours: portalData.attendance?.thisMonth?.totalHours || 0
            }
          }));
          setRecentAttendance(portalData.recentAttendance || []);
        }

        // Fetch employee's leave requests
        const requests = await getEmployeeLeaveRequests(employeeId);
        console.log('📋 Fetched leave requests for employee:', employeeId);
        console.log('📋 Leave requests data:', requests);
        
        if (requests && Array.isArray(requests)) {
          // Ensure each request has a status
          const processedRequests = requests.map(request => ({
            ...request,
            status: request.status || 'Pending'
          }));
          setMyLeaveRequests(processedRequests);
          console.log('✅ Processed leave requests:', processedRequests);
        } else {
          setMyLeaveRequests([]);
          console.log('⚠️ No leave requests found or invalid data');
        }
        
        // Check if today is a holiday
        const holidayData = await getTodayHoliday();
        setTodayHoliday(holidayData?.isHoliday ? holidayData.holiday : null);
        
        } catch (error) {
          console.error('Error loading employee portal data:', error);
        } finally {
          setDataLoaded(true);
        }
    }
  };

  // Load employee portal data on component mount
  useEffect(() => {
    loadEmployeePortalData();
  }, [currentUser?.id, currentUser?._id, currentUser?.email]);

  const handleCheckIn = async () => {
    // Check if already checked in today
    if (attendanceData.today.checkIns.length > 0) {
      setCheckInStatus('You have already checked in today!');
      setTimeout(() => setCheckInStatus(''), 3000);
      return;
    }

    setIsLoading(true);
    setCheckInStatus('Processing check-in...');

    try {
      console.log('Attempting check-in for user:', currentUser);
      console.log('User ID:', currentUser.id);
      console.log('User email:', currentUser.email);
      
      // Try to find employee by email if ID doesn't work
      let employeeId = currentUser.id || currentUser._id;
      if (!employeeId && currentUser.email) {
        const employeeData = await findEmployeeByEmail(currentUser.email);
        if (employeeData && employeeData._id) {
          employeeId = employeeData._id;
          console.log('Found employee by email for check-in:', employeeId);
        } else {
          console.error('Employee not found by email:', currentUser.email);
          setCheckInStatus('Employee not found. Please contact administrator.');
          setTimeout(() => setCheckInStatus(''), 5000);
          return;
        }
      }
      
      if (!employeeId) {
        console.error('No employee ID found');
        setCheckInStatus('Employee ID not found. Please contact administrator.');
        setTimeout(() => setCheckInStatus(''), 5000);
        return;
      }

      const result = await checkInEmployee(employeeId, {});
      
      if (result && result.checkInTime) {
        // Update local state with the response from backend
        setAttendanceData(prev => ({
          ...prev,
          today: {
            ...prev.today,
            checkIns: [result.checkInTime],
            checkOuts: [],
            status: result.status || 'Present',
            totalHours: 0
          }
        }));

        setCheckInStatus(`Check-in successful at ${result.checkInTime}!`);
        setTimeout(() => setCheckInStatus(''), 5000);
        
        // Refresh portal data to get updated statistics without page reload
        setTimeout(() => {
          loadEmployeePortalData();
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      if (error.message.includes('Already checked in')) {
        setCheckInStatus('You have already checked in today!');
      } else {
        setCheckInStatus(`Failed to check in: ${error.message}. Please try again.`);
      }
      setTimeout(() => setCheckInStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    // Check if not checked in today
    if (attendanceData.today.checkIns.length === 0) {
      setCheckInStatus('Please check in first before checking out!');
      setTimeout(() => setCheckInStatus(''), 3000);
      return;
    }

    // Check if already checked out today
    if (attendanceData.today.checkOuts.length > 0) {
      setCheckInStatus('You have already checked out today!');
      setTimeout(() => setCheckInStatus(''), 3000);
      return;
    }

    setIsLoading(true);
    setCheckInStatus('Processing check-out...');

    try {
      console.log('Attempting check-out for user:', currentUser);
      console.log('User ID:', currentUser.id);
      console.log('User email:', currentUser.email);
      
      // Try to find employee by email if ID doesn't work
      let employeeId = currentUser.id || currentUser._id;
      if (!employeeId && currentUser.email) {
        const employeeData = await findEmployeeByEmail(currentUser.email);
        if (employeeData && employeeData._id) {
          employeeId = employeeData._id;
          console.log('Found employee by email for check-out:', employeeId);
        } else {
          console.error('Employee not found by email:', currentUser.email);
          setCheckInStatus('Employee not found. Please contact administrator.');
          setTimeout(() => setCheckInStatus(''), 5000);
          return;
        }
      }
      
      if (!employeeId) {
        console.error('No employee ID found');
        setCheckInStatus('Employee ID not found. Please contact administrator.');
        setTimeout(() => setCheckInStatus(''), 5000);
        return;
      }
      
      const result = await checkOutEmployee(employeeId, {});
      
      if (result && result.checkOutTime) {
        // Update local state with the response from backend
        setAttendanceData(prev => ({
          ...prev,
          today: {
            ...prev.today,
            checkOuts: [result.checkOutTime],
            totalHours: result.hoursWorked || 0
          }
        }));

        setCheckInStatus(`Check-out successful at ${result.checkOutTime}! Hours worked: ${(result.hoursWorked || 0).toFixed(2)}`);
        setTimeout(() => setCheckInStatus(''), 5000);
        
        // Refresh portal data to get updated statistics without page reload
        setTimeout(() => {
          loadEmployeePortalData();
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error during check-out:', error);
      setCheckInStatus(`Failed to check out: ${error.message}. Please try again.`);
      setTimeout(() => setCheckInStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual reset function for testing (admin only)
  const handleManualReset = async () => {
    if (!isAdminView) return;
    
    try {
      const response = await fetch('/api/employee/manual-daily-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        window.alert(`Manual reset completed! ${result.employeesReset} employees reset.`);
        // Refresh portal data after reset
        setTimeout(() => {
          loadEmployeePortalData();
        }, 1000);
      } else {
        window.alert('Manual reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during manual reset:', error);
      window.alert('Manual reset failed. Please try again.');
    }
  };

  // Force reset function for emergency use (admin only)
  const handleForceReset = async () => {
    if (!isAdminView) return;
    
    if (!window.confirm('⚠️ FORCE RESET: This will clear ALL attendance data for today. Are you sure?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/employee/force-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        window.alert(`Force reset completed! ${result.employeesReset} employees reset.`);
        // Refresh portal data after reset
        setTimeout(() => {
          loadEmployeePortalData();
        }, 1000);
      } else {
        window.alert('Force reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during force reset:', error);
      window.alert('Force reset failed. Please try again.');
    }
  };

  // Check reset status (admin only)
  const [resetStatus, setResetStatus] = useState(null);
  
  useEffect(() => {
    if (isAdminView) {
      const checkResetStatus = async () => {
        try {
          const response = await fetch('/api/employee/reset-status');
          if (response.ok) {
            const status = await response.json();
            setResetStatus(status);
          }
        } catch (error) {
          console.error('Error checking reset status:', error);
        }
      };
      
      checkResetStatus();
      // Check status every 5 minutes
      const interval = setInterval(checkResetStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdminView]);

  // Check if currentUser is available
  if (!currentUser) {
    return (
      <div className="employee-portal">
        <div className="loading">Loading employee data...</div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (!dataLoaded) {
    return (
      <div className="employee-portal">
        <div className="loading">Loading portal data...</div>
      </div>
    );
  }

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
      window.alert('Error submitting leave request. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setLeaveFormData({
      ...leaveFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleLeaveRequestSubmitted = () => {
    // Reload data after leave request is submitted
    loadEmployeePortalData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const getStatusDisplay = (status) => {
    return status || 'Pending';
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
            <button 
              className="btn btn-warning btn-sm"
              onClick={handleManualReset}
              title="Reset all employee check-ins for testing"
            >
              🔄 Manual Reset
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleForceReset}
              title="Force reset all employee attendance data for today"
            >
              💥 Force Reset
            </button>
          </div>
        )}

        {/* Reset Status for Admin */}
        {isAdminView && resetStatus && (
          <div className="reset-status-card">
            <div className="reset-status-header">
              <span className="status-icon">🕛</span>
              <h3>Daily Reset Status</h3>
            </div>
            <div className="reset-status-content">
              <div className="status-row">
                <span className="label">Today's Date:</span>
                <span className="value">{resetStatus.date}</span>
              </div>
              <div className="status-row">
                <span className="label">Total Employees:</span>
                <span className="value">{resetStatus.totalEmployees}</span>
              </div>
              <div className="status-row">
                <span className="label">Checked In:</span>
                <span className="value success">{resetStatus.checkedIn}</span>
              </div>
              <div className="status-row">
                <span className="label">Checked Out:</span>
                <span className="value info">{resetStatus.checkedOut}</span>
              </div>
              <div className="status-row">
                <span className="label">Absent:</span>
                <span className="value warning">{resetStatus.absent}</span>
              </div>
              <div className="status-row">
                <span className="label">Last Reset:</span>
                <span className="value">{resetStatus.lastReset}</span>
              </div>
              <div className="status-row">
                <span className="label">Next Reset:</span>
                <span className="value highlight">{resetStatus.nextReset}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {checkInStatus && (
        <div className={`status-message ${checkInStatus.includes('successful') ? 'success' : 'error'}`}>
          {checkInStatus}
        </div>
      )}

      <div className="attendance-card">
        <div className="current-status-section">
          <div className="status-header">
            <span className="status-icon">🕐</span>
            <h3>Current Status</h3>
          </div>
          <div className="status-content">
            <div className="status-item">
              <span className="label">Current Time</span>
              <span className="current-time-display">{formatTime(currentTime)}</span>
            </div>
            {todayHoliday && (
              <div className="status-item">
                <span className="label">Today's Holiday</span>
                <span className="holiday-badge">
                  🎉 {todayHoliday.name}
                </span>
              </div>
            )}
            <div className="status-item">
              <span className="label">Status</span>
              <span className={`status-badge ${todayHoliday ? 'holiday' : attendanceData.today.checkIns.length > 0 ? 'checked-in' : 'not-checked'}`}>
                {todayHoliday ? 'Holiday' : attendanceData.today.checkIns.length > 0 ? 'Checked In' : 'Not Checked In'}
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
            disabled={(attendanceData.today?.checkIns?.length || 0) > 0 || isLoading || todayHoliday}
          >
                <div className="btn-icon">✅</div>
                <div className="btn-content">
                  <div className="btn-title">
                    {isLoading ? 'Processing...' : todayHoliday ? 'Holiday Today' : 'Check In'}
                  </div>
              <div className="btn-subtitle">
                {todayHoliday ? `${todayHoliday.name} - No check-in required` :
                 (attendanceData.today?.checkIns?.length || 0) > 0 ? 'Already checked in' : 'Start your shift'}
              </div>
      </div>
              </button>
              
              <button 
                className="check-out-btn"
                onClick={handleCheckOut}
            disabled={(attendanceData.today?.checkIns?.length || 0) === 0 || (attendanceData.today?.checkOuts?.length || 0) > 0 || isLoading || todayHoliday}
              >
                <div className="btn-icon">🚪</div>
                <div className="btn-content">
                  <div className="btn-title">
                    {isLoading ? 'Processing...' : todayHoliday ? 'Holiday Today' : 'Check Out'}
                  </div>
              <div className="btn-subtitle">
                {todayHoliday ? `${todayHoliday.name} - No check-out required` :
                 (attendanceData.today?.checkIns?.length || 0) === 0 ? 'Check in first' : 
                 (attendanceData.today?.checkOuts?.length || 0) > 0 ? 'Already checked out' : 'End your shift'}
              </div>
                </div>
              </button>
          </div>

        {(attendanceData.today?.checkIns?.length || 0) > 0 && (attendanceData.today?.checkOuts?.length || 0) > 0 && (
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
          <div className="stat-number">{attendanceData.thisWeek?.present || 0}</div>
          <div className="stat-label">Present This Week</div>
                          </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisWeek?.totalHours || 0}</div>
          <div className="stat-label">Hours This Week</div>
                  </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisMonth?.present || 0}</div>
          <div className="stat-label">Present This Month</div>
              </div>
        <div className="stat-card" onClick={() => navigate('/attendance-details')}>
          <div className="stat-number">{attendanceData.thisMonth?.totalHours || 0}</div>
          <div className="stat-label">Hours This Month</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="leave-balance">
          <h3>Leave Balance</h3>
          <div className="leave-cards">
            {leaveTypes && leaveTypes.length > 0 ? (
              leaveTypes.map((type, index) => {
                const typeKey = type.name.toLowerCase().replace(/\s+/g, '');
                const balance = leaveBalance[typeKey] || { total: type.days, used: 0, remaining: type.days };
                const usedDays = (myLeaveRequests || [])
                  .filter(req => req.leaveType === type.name && req.status === 'Approved')
                  .reduce((total, req) => total + (req.totalDays || 0), 0);
                const remaining = Math.max(0, balance.total - usedDays);
                
                return (
                  <div key={index} className="leave-card">
                    <div className="leave-type">{type.name}</div>
              <div className="leave-stats">
                      <span className="remaining">{remaining}</span>
                <span className="separator">/</span>
                      <span className="total">{balance.total}</span>
            </div>
            <div className="leave-progress">
              <div 
                className="progress-bar" 
                        style={{ 
                          width: `${(usedDays / balance.total) * 100}%`,
                          backgroundColor: type.color || '#007bff'
                        }}
              ></div>
            </div>
          </div>
                );
              })
            ) : (
              <div className="no-leave-types">
                <p>No leave types configured. Please contact your administrator.</p>
            </div>
            )}
        </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowLeaveForm(true)}
            disabled={!currentUser}
          >
            Request Leave
          </button>
      </div>

        <div className="recent-attendance">
          <h3>Recent Attendance</h3>
        <div className="attendance-list">
            {recentAttendance && recentAttendance.length > 0 ? (
              recentAttendance.map((record, index) => (
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
              ))
            ) : (
              <div className="no-attendance">
                <p>No recent attendance records available.</p>
              </div>
            )}
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
              {myLeaveRequests && myLeaveRequests.length > 0 ? (
                myLeaveRequests.map((request) => {
                console.log('Rendering leave request:', { 
                  id: request._id, 
                  status: request.status, 
                  type: request.leaveType,
                  fullRequest: request 
                });
                return (
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
                          <div className="days-count">({request.totalDays} days)</div>
                      </div>
                    </td>
                    <td>
                      <div className="leave-reason">{request.reason}</div>
                    </td>
                                      <td>
                    <span className={`status-badge status-${getStatusColor(request.status)}`}>
                      {getStatusDisplay(request.status)}
                    </span>
                  </td>
                      <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="no-requests">
                    <p>No leave requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLeaveForm && currentUser && (
        <LeaveRequestForm
          currentUser={currentUser}
          onRequestSubmitted={handleLeaveRequestSubmitted}
          onClose={() => setShowLeaveForm(false)}
        />
      )}
    </div>
  );
};

export default EmployeePortal; 