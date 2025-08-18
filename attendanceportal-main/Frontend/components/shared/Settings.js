import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'TechCorp Solutions',
    workingHours: {
      start: '09:00',
      end: '17:45'
    },
    lateThreshold: 15,
    overtimeThreshold: 8,
    leaveTypes: [
      { name: 'Annual Leave', days: 20, color: '#28a745' },
      { name: 'Sick Leave', days: 10, color: '#dc3545' },
      { name: 'Personal Leave', days: 5, color: '#ffc107' },
      { name: 'Maternity Leave', days: 90, color: '#6f42c1' }
    ],
    companyHolidays: [
      { name: 'New Year\'s Day', date: '2024-01-01', type: 'public', description: 'New Year Celebration' },
      { name: 'Republic Day', date: '2024-01-26', type: 'public', description: 'Indian Republic Day' },
      { name: 'Independence Day', date: '2024-08-15', type: 'public', description: 'Indian Independence Day' },
      { name: 'Company Foundation Day', date: '2024-06-15', type: 'company', description: 'Company\'s foundation anniversary' },
      { name: 'Diwali', date: '2024-11-12', type: 'public', description: 'Festival of Lights' }
    ],
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    theme: 'light'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleLeaveTypeChange = (index, field, value) => {
    const updatedLeaveTypes = [...settings.leaveTypes];
    updatedLeaveTypes[index] = {
      ...updatedLeaveTypes[index],
      [field]: value
    };
    setSettings(prev => ({
      ...prev,
      leaveTypes: updatedLeaveTypes
    }));
  };

  const handleHolidayChange = (index, field, value) => {
    const updatedHolidays = [...settings.companyHolidays];
    updatedHolidays[index] = {
      ...updatedHolidays[index],
      [field]: value
    };
    setSettings(prev => ({
      ...prev,
      companyHolidays: updatedHolidays
    }));
  };

  const addLeaveType = () => {
    setSettings(prev => ({
      ...prev,
      leaveTypes: [
        ...prev.leaveTypes,
        { name: 'New Leave Type', days: 0, color: '#007bff' }
      ]
    }));
  };

  const addHoliday = () => {
    const currentYear = new Date().getFullYear();
    setSettings(prev => ({
      ...prev,
      companyHolidays: [
        ...prev.companyHolidays,
        { 
          name: 'New Holiday', 
          date: `${currentYear}-01-01`, 
          type: 'company', 
          description: 'Holiday description' 
        }
      ]
    }));
  };

  const removeLeaveType = (index) => {
    setSettings(prev => ({
      ...prev,
      leaveTypes: prev.leaveTypes.filter((_, i) => i !== index)
    }));
  };

  const removeHoliday = (index) => {
    setSettings(prev => ({
      ...prev,
      companyHolidays: prev.companyHolidays.filter((_, i) => i !== index)
    }));
  };

  const replicateHolidaysToAllEmployees = () => {
    // This function would sync holidays to all employee calendars
    alert('Holidays have been replicated to all employee calendars!');
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your attendance portal settings.</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General Settings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ⏰ Attendance Rules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >
            📅 Leave Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'holidays' ? 'active' : ''}`}
            onClick={() => setActiveTab('holidays')}
          >
            🎉 Company Holidays
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Appearance
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Working Hours Start</label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => handleSettingChange('workingHours', 'start', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Working Hours End</label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => handleSettingChange('workingHours', 'end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="settings-section">
              <h3>Attendance Rules</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Late Arrival Threshold (minutes)</label>
                  <input
                    type="number"
                    value={settings.lateThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, lateThreshold: parseInt(e.target.value) }))}
                    min="0"
                    max="60"
                  />
                </div>
                <div className="form-group">
                  <label>Overtime Threshold (hours)</label>
                  <input
                    type="number"
                    value={settings.overtimeThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, overtimeThreshold: parseInt(e.target.value) }))}
                    min="1"
                    max="12"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="settings-section">
              <h3>Leave Management</h3>
              <div className="leave-types">
                {settings.leaveTypes.map((leaveType, index) => (
                  <div key={index} className="leave-type-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Leave Type Name</label>
                        <input
                          type="text"
                          value={leaveType.name}
                          onChange={(e) => handleLeaveTypeChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Days Allowed</label>
                        <input
                          type="number"
                          value={leaveType.days}
                          onChange={(e) => handleLeaveTypeChange(index, 'days', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Color</label>
                        <input
                          type="color"
                          value={leaveType.color}
                          onChange={(e) => handleLeaveTypeChange(index, 'color', e.target.value)}
                        />
                      </div>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeLeaveType(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-primary"
                  onClick={addLeaveType}
                >
                  Add Leave Type
                </button>
              </div>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div className="settings-section">
              <h3>Company Holidays</h3>
              <div className="holiday-info">
                <p>Manage company holidays and public holidays that will be automatically applied to all employee calendars.</p>
                <button 
                  className="btn btn-success"
                  onClick={replicateHolidaysToAllEmployees}
                >
                  🔄 Sync to All Employee Calendars
                </button>
              </div>
              
              <div className="holiday-types">
                {settings.companyHolidays.map((holiday, index) => (
                  <div key={index} className={`holiday-item ${holiday.type}`}>
                    <div className="holiday-header">
                      <span className={`holiday-type-badge ${holiday.type}`}>
                        {holiday.type === 'public' ? '🇮🇳 Public' : '🏢 Company'}
                      </span>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeHoliday(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Holiday Name</label>
                        <input
                          type="text"
                          value={holiday.name}
                          onChange={(e) => handleHolidayChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={holiday.date}
                          onChange={(e) => handleHolidayChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={holiday.type}
                          onChange={(e) => handleHolidayChange(index, 'type', e.target.value)}
                        >
                          <option value="public">Public Holiday</option>
                          <option value="company">Company Holiday</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        value={holiday.description}
                        onChange={(e) => handleHolidayChange(index, 'description', e.target.value)}
                        placeholder="Brief description of the holiday"
                      />
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-primary"
                  onClick={addHoliday}
                >
                  ➕ Add New Holiday
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="notification-options">
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                    Email Notifications
                  </label>
                  <p>Receive attendance reports and updates via email</p>
                </div>
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    />
                    SMS Notifications
                  </label>
                  <p>Receive important alerts via SMS</p>
                </div>
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                    Push Notifications
                  </label>
                  <p>Receive real-time notifications in the browser</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              <div className="form-group">
                <label>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Settings
            </button>
            <button className="btn" onClick={() => window.location.reload()}>
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 