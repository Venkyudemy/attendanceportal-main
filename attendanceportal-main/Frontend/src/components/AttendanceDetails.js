import React, { useState, useEffect } from 'react';
import './AttendanceDetails.css';

const AttendanceDetails = ({ currentUser }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const generateMonthlyData = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1);
      const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const data = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        data.push({
          date: null,
          day: '',
          dayName: '',
          status: 'empty',
          checkIn: null,
          checkOut: null,
          hours: 0,
          isToday: false
        });
      }

      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isToday = date.toDateString() === new Date().toDateString();
        
        // Generate random attendance data
        const random = Math.random();
        let status, checkIn, checkOut, hours;
        
        if (isWeekend) {
          status = 'Weekend';
          checkIn = null;
          checkOut = null;
          hours = 0;
        } else if (random < 0.1) {
          status = 'Absent';
          checkIn = null;
          checkOut = null;
          hours = 0;
        } else if (random < 0.2) {
          status = 'Late';
          checkIn = '09:45 AM';
          checkOut = '05:30 PM';
          hours = 7.75;
        } else {
          status = 'Present';
          checkIn = '09:00 AM';
          checkOut = '05:30 PM';
          hours = 8.5;
        }

        data.push({
          date: date,
          day: day,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          status,
          checkIn,
          checkOut,
          hours,
          isToday
        });
      }

      setAttendanceData(data);
      setLoading(false);
    };

    generateMonthlyData();
  }, [currentMonth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Weekend': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMonthStats = () => {
    const present = attendanceData.filter(d => d.status === 'Present').length;
    const late = attendanceData.filter(d => d.status === 'Late').length;
    const absent = attendanceData.filter(d => d.status === 'Absent').length;
    const totalHours = attendanceData.reduce((sum, d) => sum + d.hours, 0);
    
    return { present, late, absent, totalHours };
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
               className={`calendar-day ${day.isToday ? 'today' : ''} ${day.status.toLowerCase()}`}
             >
               <div className="day-number">{day.day}</div>
               {day.status !== 'empty' && (
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
                   <td>{day.date ? day.date.toLocaleDateString() : '-'}</td>
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