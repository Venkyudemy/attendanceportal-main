import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './EmployeeAttendanceView.css';

const EmployeeAttendanceView = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [employee, setEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [companyHolidays, setCompanyHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch company holidays from settings
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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Fetch company holidays first
        await fetchCompanyHolidays();
        
        // Fetch employee details
        const employeeResponse = await fetch(`http://localhost:5000/api/employee/${employeeId}`);
        if (!employeeResponse.ok) {
          throw new Error('Failed to fetch employee data');
        }
        const employeeData = await employeeResponse.json();
        setEmployee(employeeData);

        // Generate monthly attendance data with proper calendar alignment
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get the first day of the month and its day of week (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(year, month, 1);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        
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
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = date.toDateString() === currentDate.toDateString();
          const isHoliday = isCompanyHoliday(date);
          const holidayName = getHolidayName(date);
          
          // Generate random attendance data for demonstration
          let status = 'Absent';
          let checkIn = null;
          let checkOut = null;
          let hours = 0;
          
          // If it's a holiday, don't generate attendance data
          if (!isWeekend && !isHoliday) {
            const random = Math.random();
            if (random > 0.3) {
              status = 'Present';
              checkIn = '09:00 AM';
              checkOut = '05:30 PM';
              hours = 8.5;
            } else if (random > 0.1) {
              status = 'Late';
              checkIn = '10:30 AM';
              checkOut = '06:00 PM';
              hours = 7.5;
            } else if (random > 0.05) {
              status = 'On Leave';
            }
          }
          
          monthlyData.push({
            date,
            day: day,
            isWeekend,
            isToday,
            isHoliday,
            holidayName,
            status,
            checkIn,
            checkOut,
            hours,
            isEmpty: false
          });
        }
        
        setAttendanceData(monthlyData);
        setError(null);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const getStatusColor = (status, isHoliday) => {
    if (isHoliday) return 'holiday';
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'On Leave': return 'info';
      case 'Weekend': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMonthStats = () => {
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(day => day.status === 'Present').length;
    const lateDays = attendanceData.filter(day => day.status === 'Late').length;
    const absentDays = attendanceData.filter(day => day.status === 'Absent').length;
    const leaveDays = attendanceData.filter(day => day.status === 'On Leave').length;
    const weekendDays = attendanceData.filter(day => day.isWeekend).length;
    const holidayDays = attendanceData.filter(day => day.isHoliday).length;
    
    const totalHours = attendanceData.reduce((sum, day) => sum + day.hours, 0);
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / (totalDays - weekendDays - holidayDays)) * 100) : 0;
    
    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      weekendDays,
      holidayDays,
      totalHours,
      attendanceRate
    };
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
    
    // Regenerate calendar data for the new month
    const year = newMonth.getFullYear();
    const month = newMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the first day of the month and its day of week
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const newMonthlyData = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      newMonthlyData.push({
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
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.toDateString() === new Date().toDateString();
      const isHoliday = isCompanyHoliday(date);
      const holidayName = getHolidayName(date);
      
      // Generate random attendance data for demonstration
      let status = 'Absent';
      let checkIn = null;
      let checkOut = null;
      let hours = 0;
      
      // If it's a holiday, don't generate attendance data
      if (!isWeekend && !isHoliday) {
        const random = Math.random();
        if (random > 0.3) {
          status = 'Present';
          checkIn = '09:00 AM';
          checkOut = '05:30 PM';
          hours = 8.5;
        } else if (random > 0.1) {
          status = 'Late';
          checkIn = '10:30 AM';
          checkOut = '06:00 PM';
          hours = 7.5;
        } else if (random > 0.05) {
          status = 'On Leave';
        }
      }
      
      newMonthlyData.push({
        date,
        day: day,
        isWeekend,
        isToday,
        isHoliday,
        holidayName,
        status,
        checkIn,
        checkOut,
        hours,
        isEmpty: false
      });
    }
    
    setAttendanceData(newMonthlyData);
  };

  const stats = getMonthStats();

  if (loading) {
    return (
      <div className="employee-attendance-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-attendance-view">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-attendance-view">
        <div className="error-container">
          <p className="error-message">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-attendance-view">
      <div className="page-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/employees')}
          >
            ← Back to Employees
          </button>
          <div className="employee-info">
            <div className="employee-avatar">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div className="employee-details">
              <h1 className="page-title">{employee.name}</h1>
              <p className="employee-subtitle">
                {employee.position} • {employee.department} • {employee.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="attendance-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.attendanceRate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
          <div className="stat-card success">
            <div className="stat-number">{stats.presentDays}</div>
            <div className="stat-label">Present Days</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{stats.lateDays}</div>
            <div className="stat-label">Late Days</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-number">{stats.absentDays}</div>
            <div className="stat-label">Absent Days</div>
          </div>
          <div className="stat-card info">
            <div className="stat-number">{stats.leaveDays}</div>
            <div className="stat-label">Leave Days</div>
          </div>
          <div className="stat-card holiday">
            <div className="stat-number">{stats.holidayDays}</div>
            <div className="stat-label">Holidays</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalHours.toFixed(1)}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>

      <div className="attendance-calendar">
        <div className="calendar-header">
          <h2>Monthly Attendance Calendar</h2>
          <div className="month-navigation">
            <button onClick={() => changeMonth('prev')} className="nav-btn">‹</button>
            <span className="current-month">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth('next')} className="nav-btn">›</button>
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
              {!day.isEmpty ? (
                <>
                  <div className="day-number">{day.day}</div>
                  {day.isHoliday ? (
                    <div className="holiday-indicator">
                      <span className="holiday-text">H</span>
                      <div className="holiday-tooltip">{day.holidayName}</div>
                    </div>
                  ) : !day.isWeekend ? (
                    <div className={`status-indicator ${getStatusColor(day.status, day.isHoliday)}`}>
                      {day.status.charAt(0)}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="empty-day"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="attendance-details">
        <h2>Detailed Attendance Log</h2>
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData
                .filter(day => !day.isEmpty && !day.isWeekend && day.status !== 'Weekend' && day.date)
                .map((day, index) => (
                  <tr key={index} className={day.isToday ? 'today-row' : ''}>
                    <td>{day.date ? day.date.toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(day.status, day.isHoliday)}`}>
                        {day.isHoliday ? 'Holiday' : day.status}
                      </span>
                    </td>
                    <td>{day.isHoliday ? 'Holiday' : (day.checkIn || 'Not checked in')}</td>
                    <td>{day.isHoliday ? 'Holiday' : (day.checkOut || 'Not checked out')}</td>
                    <td>{day.isHoliday ? 'Holiday' : (day.hours > 0 ? `${day.hours}h` : '-')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceView; 