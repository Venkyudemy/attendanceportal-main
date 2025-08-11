import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AttendanceDetails.css';

const AttendanceDetails = ({ currentUser }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [monthStats, setMonthStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0 });
  const location = useLocation();

  // Fetch real attendance data from backend
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Get employee ID from currentUser or location state
        let employeeId = currentUser?.id;
        if (!employeeId && currentUser?.email) {
          // Try to find employee by email if ID doesn't work
          const findResponse = await fetch(`http://localhost:5000/api/employee/find-by-email/${encodeURIComponent(currentUser.email)}`);
          if (findResponse.ok) {
            const employeeData = await findResponse.json();
            employeeId = employeeData._id;
          }
        }
        
        if (!employeeId) {
          console.error('No employee ID found');
          setLoading(false);
          return;
        }

        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        
        const response = await fetch(`http://localhost:5000/api/employee/${employeeId}/attendance-details?month=${month}&year=${year}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        setAttendanceData(data.calendarData);
        setMonthStats(data.monthStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentMonth, currentUser]);

  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Weekend': return 'secondary';
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
        <button 
          className="nav-btn"
          onClick={() => changeMonth('prev')}
        >
          ← Previous Month
        </button>
        <h2 className="current-month">
          {currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h2>
        <button 
          className="nav-btn"
          onClick={() => changeMonth('next')}
        >
          Next Month →
        </button>
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
           {attendanceData.map((day, index) => (
             <div 
               key={index} 
               className={`calendar-day ${day.isToday ? 'today' : ''} ${day.status && day.status !== 'empty' ? day.status.toLowerCase() : 'empty'}`}
             >
               <div className="day-number">{day.day || ''}</div>
               {day.status && day.status !== 'empty' && (
                 <>
                   <div className="day-status">
                     <span className={`status-badge ${getStatusColor(day.status)}`}>
                       {day.status}
                     </span>
                   </div>
                   {day.checkIn && (
                     <div className="day-time">
                       <div className="time-in">In: {day.checkIn}</div>
                       <div className="time-out">Out: {day.checkOut}</div>
                       <div className="time-hours">{day.hours}h</div>
                     </div>
                   )}
                 </>
               )}
             </div>
           ))}
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
                   <td>{day.date && day.date instanceof Date ? day.date.toLocaleDateString() : '-'}</td>
                   <td>{day.dayName}</td>
                   <td>
                     <span className={`status-badge ${getStatusColor(day.status)}`}>
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