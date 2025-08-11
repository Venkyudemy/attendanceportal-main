import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
    lateArrivals: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch recent activities from backend
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employee/admin/recent-activities?limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }
      
      const data = await response.json();
      setRecentActivities(data.recentActivities);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      // Keep existing activities if fetch fails
    }
  };

  // Fetch attendance data from backend
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/employee/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        setAttendanceData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
    fetchRecentActivities(); // Fetch recent activities
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchAttendanceData();
      fetchRecentActivities(); // Refresh recent activities too
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
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
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="time-display">
        <div className="current-time">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="current-date">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/admin/total')}>
          <div className="stat-number">{attendanceData.totalEmployees}</div>
          <div className="stat-label">Total Employees</div>
          <div className="stat-hint">Click to view all employees</div>
        </div>
        <div className="stat-card success clickable" onClick={() => navigate('/admin/present')}>
          <div className="stat-number">{attendanceData.presentToday}</div>
          <div className="stat-label">Present Today</div>
          <div className="stat-hint">Click to view present employees</div>
        </div>
        <div className="stat-card warning clickable" onClick={() => navigate('/admin/late')}>
          <div className="stat-number">{attendanceData.lateArrivals}</div>
          <div className="stat-label">Late Arrivals</div>
          <div className="stat-hint">Click to view late employees</div>
        </div>
        <div className="stat-card danger clickable" onClick={() => navigate('/admin/absent')}>
          <div className="stat-number">{attendanceData.absentToday}</div>
          <div className="stat-label">Absent Today</div>
          <div className="stat-hint">Click to view absent employees</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/high-attendance')}>
          <div className="stat-number">{attendanceData.attendanceRate}%</div>
          <div className="stat-label">Attendance Rate</div>
          <div className="stat-hint">Click to view employees with high attendance</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/admin/leave-management')}>
          <div className="stat-number">{attendanceData.onLeave}</div>
          <div className="stat-label">On Leave</div>
          <div className="stat-hint">Click to view leave management</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="chart-container">
          <h3>Attendance Overview</h3>
          <div className="attendance-chart">
            <div className="chart-bar">
              <div className="bar-label">Present</div>
              <div className="bar-container">
                <div 
                  className="bar-fill present" 
                  style={{ width: `${(attendanceData.presentToday / attendanceData.totalEmployees) * 100}%` }}
                ></div>
              </div>
              <div className="bar-value">{attendanceData.presentToday}</div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">Late</div>
              <div className="bar-container">
                <div 
                  className="bar-fill late" 
                  style={{ width: `${(attendanceData.lateArrivals / attendanceData.totalEmployees) * 100}%` }}
                ></div>
              </div>
              <div className="bar-value">{attendanceData.lateArrivals}</div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">Absent</div>
              <div className="bar-container">
                <div 
                  className="bar-fill absent" 
                  style={{ width: `${(attendanceData.absentToday / attendanceData.totalEmployees) * 100}%` }}
                ></div>
              </div>
              <div className="bar-value">{attendanceData.absentToday}</div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">On Leave</div>
              <div className="bar-container">
                <div 
                  className="bar-fill leave" 
                  style={{ width: `${(attendanceData.onLeave / attendanceData.totalEmployees) * 100}%` }}
                ></div>
              </div>
              <div className="bar-value">{attendanceData.onLeave}</div>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activities</h3>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'check-in' ? '✅' : activity.type === 'check-out' ? '🚪' : '📅'}
                </div>
                <div className="activity-details">
                  <h4>{activity.employeeName}</h4>
                  <p>{activity.timestamp} - {activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 