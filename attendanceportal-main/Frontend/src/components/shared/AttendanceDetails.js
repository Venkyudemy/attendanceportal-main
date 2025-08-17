import React, { useState, useEffect } from 'react';
import { findEmployeeByEmail, getAttendanceDetailsById } from '../../services/api';
import './AttendanceDetails.css';

const AttendanceDetails = ({ currentUser }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [monthStats, setMonthStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0 });
  const [holidays, setHolidays] = useState([]);
  // const location = useLocation(); // Removed unused variable

  // Helper: normalize to YYYY-MM-DD or null
  const getDateString = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  };

  const findHolidayForDate = (date) => {
    const dateString = getDateString(date);
    if (!dateString) return null;
    return holidays.find((h) => h.date === dateString) || null;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '-';
    if (date instanceof Date) return date.toLocaleDateString();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? '-' : parsed.toLocaleDateString();
  };

  // Fetch real attendance data from backend
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching attendance data for user:', currentUser);
        
        // Get employee ID from currentUser or location state
        let employeeId = currentUser?.id;
        if (!employeeId && currentUser?.email) {
          // Try to find employee by email if ID doesn't work
          const employeeData = await findEmployeeByEmail(currentUser.email);
          if (employeeData && employeeData._id) {
            employeeId = employeeData._id;
            console.log('✅ Found employee by email for attendance details:', employeeId);
          }
        }
        
        if (!employeeId) {
          console.error('❌ No employee ID found');
          setLoading(false);
          return;
        }

        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        
        console.log('📅 Fetching attendance for month:', month, 'year:', year);
        const data = await getAttendanceDetailsById(employeeId, month, year);
        console.log('📊 Received attendance data:', data);
        console.log('📅 Calendar data length:', data.calendarData?.length);
        console.log('📊 Month stats:', data.monthStats);
        console.log('🎉 Month holidays:', data.monthHolidays);
        
        setAttendanceData(data.calendarData || []);
        setMonthStats(data.monthStats || { present: 0, late: 0, absent: 0, totalHours: 0 });
        setHolidays(data.monthHolidays || []);
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching attendance data:', error);
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentMonth, currentUser]);

  const getStatusColor = (status, date) => {
    if (!status) return 'secondary';
    
    const holiday = findHolidayForDate(date);
    if (holiday) return 'holiday';
    
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Weekend': return 'secondary';
      case 'Leave': return 'info';
      default: return 'secondary';
    }
  };

  const getMonthStats = () => {
    return monthStats;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const stats = getMonthStats();

  if (loading) {
    return (
      <div className="attendance-details">
        <div className="loading">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="attendance-details">
      <div className="page-header">
        <h1 className="page-title">Monthly Attendance Details</h1>
        <p className="page-subtitle">
          {currentUser?.name || 'Employee'} • {currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      <div className="month-navigation">
        <button className="nav-btn" onClick={() => changeMonth('prev')}>← Previous Month</button>
        <h2 className="current-month">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button className="nav-btn" onClick={() => changeMonth('next')}>Next Month →</button>
      </div>

      <div className="monthly-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.present}</div>
          <div className="stat-label">Present Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.late}</div>
          <div className="stat-label">Late Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.absent}</div>
          <div className="stat-label">Absent Days</div>
        </div>
        <div className="stat-card leave">
          <div className="stat-number">{stats.leave || 0}</div>
          <div className="stat-label">Leave Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalHours.toFixed(1)}</div>
          <div className="stat-label">Total Hours</div>
        </div>
      </div>

      <div className="attendance-calendar">
        <div className="calendar-header">
          <div className="day-header">Sun</div>
          <div className="day-header">Mon</div>
          <div className="day-header">Tue</div>
          <div className="day-header">Wed</div>
          <div className="day-header">Thu</div>
          <div className="day-header">Fri</div>
          <div className="day-header">Sat</div>
        </div>
        
        <div className="calendar-grid">
          {console.log('🎯 Rendering calendar with data:', attendanceData)}
          {attendanceData && attendanceData.length > 0 ? (
            attendanceData.map((day, index) => {
              console.log(`📅 Day ${index}:`, day);
              const holiday = findHolidayForDate(day.date);
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${day.isToday ? 'today' : ''} ${day.status && day.status !== 'empty' ? day.status.toLowerCase() : 'empty'} ${day.isLeave ? 'leave' : ''}`}
                >
                  <div className="day-number">{day.day || ''}</div>
                  {day.status && day.status !== 'empty' && (
                    <>
                      <div className="day-status">
                        <span className={`status-badge ${getStatusColor(day.status, day.date)}`}>
                          {holiday ? holiday.name : day.isLeave ? `Leave (${day.leaveType})` : day.status}
                        </span>
                      </div>
                      {day.checkIn && !day.isLeave && (
                        <div className="day-time">
                          <div className="time-in">In: {day.checkIn}</div>
                          <div className="time-out">Out: {day.checkOut}</div>
                        </div>
                      )}
                      {day.isLeave && (
                        <div className="leave-info">
                          <div className="leave-type-badge">{day.leaveType}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
              No attendance data available for this month
            </div>
          )}
        </div>
      </div>

      <div className="attendance-list">
        <h3>Detailed Attendance Records</h3>
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData
                .filter(day => day.status !== 'Weekend' && day.status !== 'empty' && day.date)
                .map((day, index) => (
                <tr key={index} className={day.isToday ? 'today-row' : ''}>
                  <td>{formatDisplayDate(day.date)}</td>
                  <td>{day.dayName}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(day.status, day.date)}`}>
                      {day.status}
                    </span>
                  </td>
                  <td>{day.checkIn || '-'}</td>
                  <td>{day.checkOut || '-'}</td>
                  <td>{day.hours > 0 ? `${day.hours}h` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AttendanceDetails; 