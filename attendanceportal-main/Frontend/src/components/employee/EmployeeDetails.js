import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, getEmployeeLeaveBalance, recalculateEmployeeLeaveBalance, getAttendanceDetailsById, syncAllEmployeesLeaveBalanceStructure } from '../../services/api';
import './EmployeeDetails.css';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveBalanceLoading, setLeaveBalanceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [companyHolidays, setCompanyHolidays] = useState([]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching employee details for ID:', employeeId);
        
        // Fetch employee details first
        const employeeData = await getEmployeeById(employeeId);
        console.log('✅ Employee details received:', employeeData);
        console.log('📊 Attendance data:', employeeData.attendance);
        console.log('🆔 Employee ID in data:', employeeData._id);
        
        setEmployee(employeeData);
        
        // Use employee's stored leave balance directly (more reliable)
        if (employeeData.leaveBalance) {
          console.log('✅ Using employee stored leave balance:', employeeData.leaveBalance);
          setLeaveBalance(employeeData.leaveBalance);
        } else {
          console.log('⚠️ No leave balance found in employee data, trying API...');
          try {
            const leaveBalanceData = await getEmployeeLeaveBalance(employeeId);
            console.log('✅ Leave balance from API:', leaveBalanceData);
            setLeaveBalance(leaveBalanceData);
          } catch (leaveBalanceErr) {
            console.error('❌ Error fetching leave balance from API:', leaveBalanceErr);
            setLeaveBalance(null);
          }
        }
        
        setError(null);
        setLeaveBalanceLoading(false);
      } catch (err) {
        console.error('❌ Error fetching employee details:', err);
        setError(`Failed to load employee details: ${err.message}`);
        setLeaveBalanceLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

  // Fetch company holidays
  useEffect(() => {
    const fetchCompanyHolidays = async () => {
      try {
        // In a real app, this would fetch from your backend API
        // For now, we'll use the same structure as defined in Settings
        const holidays = [
          { name: 'New Year\'s Day', date: '2024-01-01', type: 'public', description: 'New Year Celebration' },
          { name: 'Republic Day', date: '2024-01-26', type: 'public', description: 'Indian Republic Day' },
          { name: 'Independence Day', date: '2024-08-15', type: 'public', description: 'Indian Independence Day' },
          { name: 'Company Foundation Day', date: '2024-06-15', type: 'company', description: 'Company\'s foundation anniversary' },
          { name: 'Diwali', date: '2024-11-12', type: 'public', description: 'Festival of Lights' }
        ];
        setCompanyHolidays(holidays);
      } catch (err) {
        console.error('Error fetching company holidays:', err);
      }
    };

    fetchCompanyHolidays();
  }, []);

  // Generate monthly attendance calendar data
  useEffect(() => {
    if (showAttendanceHistory && employee) {
      fetchAttendanceDetails();
    }
  }, [showAttendanceHistory, currentMonth, employee]);

  const fetchAttendanceDetails = async () => {
    if (!employee) return;

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // API expects 1-based month
      
      console.log('📅 Fetching attendance details for:', year, month, 'Employee ID:', employee._id);
      
      const attendanceDetails = await getAttendanceDetailsById(employee._id, month, year);
      
      console.log('✅ Attendance details received:', attendanceDetails);
      
      if (attendanceDetails && attendanceDetails.calendarData) {
        setAttendanceData(attendanceDetails.calendarData);
      } else {
        console.log('⚠️ No calendar data in response, generating fallback');
        generateMonthlyCalendar();
      }
    } catch (error) {
      console.error('❌ Error fetching attendance details:', error);
      console.log('🔄 Falling back to local calendar generation');
      generateMonthlyCalendar();
    }
  };

  const generateMonthlyCalendar = () => {
    if (!employee) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    console.log('📅 Generating fallback calendar for:', year, month + 1, 'Days in month:', daysInMonth);
    
    // Get the first day of the month and its day of week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    console.log('📅 First day of month:', firstDayOfMonth, 'Starting day of week:', startingDayOfWeek);
    
    const monthlyData = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthlyData.push({
        date: null,
        day: null,
        isWeekend: false,
        isToday: false,
        isHoliday: false,
        holidayName: null,
        status: 'empty',
        checkIn: null,
        checkOut: null,
        hours: 0,
        isEmpty: true
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isHoliday = isCompanyHoliday(currentDate);
      const holidayName = isHoliday ? getHolidayName(currentDate) : null;
      
      // Get attendance data for this day from employee records
      const dayAttendance = employee.attendance?.records?.find(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === currentDate.toDateString();
      });
      
      monthlyData.push({
        date: currentDate,
        day: day,
        isWeekend,
        isToday,
        isHoliday,
        holidayName,
        status: dayAttendance ? dayAttendance.status : (isWeekend ? 'Weekend' : 'Absent'),
        checkIn: dayAttendance?.checkIn || null,
        checkOut: dayAttendance?.checkOut || null,
        hours: dayAttendance?.hours || 0,
        isEmpty: false
      });
    }
    
    console.log('✅ Fallback calendar data generated:', monthlyData.length, 'days');
    setAttendanceData(monthlyData);
  };

  // Check if a date is a company holiday
  const isCompanyHoliday = (date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    return companyHolidays.find(holiday => holiday.date === dateString);
  };

  // Get holiday name for a date
  const getHolidayName = (date) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    const holiday = companyHolidays.find(holiday => holiday.date === dateString);
    return holiday ? holiday.name : null;
  };

  // Change month for calendar navigation
  const changeMonth = (direction) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

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

  const handleRecalculateLeaveBalance = async () => {
    try {
      setLeaveBalanceLoading(true);
      console.log('🔄 Recalculating leave balance for employee:', employeeId);
      
      // First sync the leave balance structure with admin settings
      await syncAllEmployeesLeaveBalanceStructure();
      
      // Then recalculate for this specific employee
      const result = await recalculateEmployeeLeaveBalance(employeeId);
      console.log('✅ Leave balance recalculated:', result);
      
      // Refresh the leave balance data
      const updatedLeaveBalance = await getEmployeeLeaveBalance(employeeId);
      setLeaveBalance(updatedLeaveBalance);
      
      // Show success message
      alert('Leave balance recalculated successfully!');
    } catch (error) {
      console.error('❌ Error recalculating leave balance:', error);
      alert('Failed to recalculate leave balance. Please try again.');
    } finally {
      setLeaveBalanceLoading(false);
    }
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
                {leaveBalanceLoading ? (
                  <div className="leave-balance-loading">
                    <p>Loading leave balance...</p>
                  </div>
                ) : leaveBalance ? (
                  <div className="leave-balance-grid">
                    <div className="leave-type">
                      <span className="leave-label">Annual Leave:</span>
                      <span className="leave-value">
                        {leaveBalance.annualleave?.remaining || leaveBalance.annual?.remaining || 0} / {leaveBalance.annualleave?.total || leaveBalance.annual?.total || 0}
                      </span>
                    </div>
                    <div className="leave-type">
                      <span className="leave-label">Sick Leave:</span>
                      <span className="leave-value">
                        {leaveBalance.sickleave?.remaining || leaveBalance.sick?.remaining || 0} / {leaveBalance.sickleave?.total || leaveBalance.sick?.total || 0}
                      </span>
                    </div>
                    <div className="leave-type">
                      <span className="leave-label">Personal Leave:</span>
                      <span className="leave-value">
                        {leaveBalance.personalleave?.remaining || leaveBalance.personal?.remaining || 0} / {leaveBalance.personalleave?.total || leaveBalance.personal?.total || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="leave-balance-loading">
                    <p>Leave balance data not available</p>
                  </div>
                )}
                <div className="leave-balance-actions">
                  <button 
                    className="btn btn-primary recalculate-btn"
                    onClick={handleRecalculateLeaveBalance}
                    disabled={leaveBalanceLoading}
                  >
                    {leaveBalanceLoading ? 'Recalculating...' : 'Recalculate Leave Balance'}
                  </button>
                  <button 
                    className="btn btn-secondary refresh-btn"
                    onClick={async () => {
                      try {
                        setLeaveBalanceLoading(true);
                        console.log('🔄 Refreshing employee data and leave balance...');
                        
                        // First sync the leave balance structure
                        await syncAllEmployeesLeaveBalanceStructure();
                        
                        // Then get fresh employee data
                        const freshEmployeeData = await getEmployeeById(employeeId);
                        setEmployee(freshEmployeeData);
                        
                        // Use the fresh leave balance from employee data
                        if (freshEmployeeData.leaveBalance) {
                          setLeaveBalance(freshEmployeeData.leaveBalance);
                          console.log('✅ Leave balance refreshed from employee data:', freshEmployeeData.leaveBalance);
                        } else {
                          console.log('⚠️ No leave balance in fresh employee data');
                        }
                      } catch (error) {
                        console.error('❌ Error refreshing leave balance:', error);
                      } finally {
                        setLeaveBalanceLoading(false);
                      }
                    }}
                    disabled={leaveBalanceLoading}
                  >
                    {leaveBalanceLoading ? 'Refreshing...' : 'Refresh Leave Balance'}
                  </button>
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
                      {employee.leaveBalance?.annualleave?.remaining || employee.leaveBalance?.annual?.remaining || 0} / {employee.leaveBalance?.annualleave?.total || employee.leaveBalance?.annual?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Sick Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.sickleave?.remaining || employee.leaveBalance?.sick?.remaining || 0} / {employee.leaveBalance?.sickleave?.total || employee.leaveBalance?.sick?.total || 0}
                    </span>
                  </div>
                  <div className="leave-type">
                    <span className="leave-label">Personal Leave:</span>
                    <span className="leave-value">
                      {employee.leaveBalance?.personalleave?.remaining || employee.leaveBalance?.personal?.remaining || 0} / {employee.leaveBalance?.personalleave?.total || employee.leaveBalance?.personal?.total || 0}
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

            {/* Monthly Attendance Calendar */}
            <div className="attendance-calendar-section">
              <div className="calendar-header">
                <h3 className="section-title">Monthly Attendance Calendar</h3>
                <div className="month-navigation">
                  <button onClick={() => changeMonth('prev')} className="nav-btn">‹ Previous Month</button>
                  <span className="current-month">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => changeMonth('next')} className="nav-btn">Next Month ›</button>
                </div>
              </div>

              {/* Attendance Summary Statistics */}
              <div className="attendance-summary-stats">
                <div className="stat-card present">
                  <div className="stat-number">
                    {attendanceData.filter(day => day.status === 'Present').length}
                  </div>
                  <div className="stat-label">PRESENT DAYS</div>
                </div>
                <div className="stat-card late">
                  <div className="stat-number">
                    {attendanceData.filter(day => day.status === 'Late').length}
                  </div>
                  <div className="stat-label">LATE DAYS</div>
                </div>
                <div className="stat-card absent">
                  <div className="stat-number">
                    {attendanceData.filter(day => day.status === 'Absent').length}
                  </div>
                  <div className="stat-label">ABSENT DAYS</div>
                </div>
                <div className="stat-card hours">
                  <div className="stat-number">
                    {attendanceData.reduce((total, day) => total + (day.hours || 0), 0).toFixed(1)}
                  </div>
                  <div className="stat-label">TOTAL HOURS</div>
                </div>
              </div>

              <div className="calendar-grid">
                <div className="calendar-header-row">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                
                {attendanceData.map((day, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${day.isWeekend ? 'weekend' : ''} ${day.isToday ? 'today' : ''} ${day.isEmpty ? 'empty' : ''} ${day.isHoliday ? 'holiday' : ''}`}
                  >
                    <div className="day-number">{day.day}</div>
                    {day.isWeekend ? (
                      <div className="weekend-label">WEEKEND</div>
                    ) : day.isHoliday ? (
                      <div className="holiday-label">{day.holidayName}</div>
                    ) : day.status && day.status !== '' ? (
                      <div className={`status-label ${day.status.toLowerCase()}`}>
                        {day.status}
                        {day.checkIn && <div className="check-time">In {day.checkIn}</div>}
                        {day.checkOut && <div className="check-time">Out {day.checkOut}</div>}
                      </div>
                    ) : (
                      <div className="empty-status"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
