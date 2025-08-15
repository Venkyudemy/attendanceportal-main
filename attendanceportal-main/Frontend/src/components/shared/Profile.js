import React, { useState, useEffect } from 'react';
import { getProfileData, updateProfileData, findEmployeeByEmail, getGeneralSettings } from '../../services/api';
import './Profile.css';

const Profile = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    // Work Information (Admin only)
    employeeId: '',
    domain: '',
    department: '',
    position: '',
    hireDate: '',
    salary: '',
    manager: '',
    // Emergency Contact (Employee can edit)
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    },
    // General Settings
    generalSettings: {
      companyName: 'TechCorp Solutions',
      workingHoursStart: '09:00 AM',
      workingHoursEnd: '05:00 PM'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Fetch general settings first
        const generalSettingsData = await getGeneralSettings();
        console.log('📊 Fetched general settings:', generalSettingsData);
        
        // Try to find employee by email if ID doesn't work
        let employeeId = currentUser.id;
        if (!employeeId && currentUser.email) {
          const employeeData = await findEmployeeByEmail(currentUser.email);
          if (employeeData && employeeData._id) {
            employeeId = employeeData._id;
            console.log('✅ Found employee by email for profile:', employeeId);
          } else {
            console.error('❌ Employee not found by email:', currentUser.email);
            setError('Employee not found. Please contact administrator.');
            return;
          }
        }
        
        if (!employeeId) {
          console.error('❌ No employee ID found');
          setError('Employee ID not found. Please contact administrator.');
          return;
        }
        
        // Fetch employee details from backend
        const employeeData = await getProfileData(employeeId);
        
        if (!employeeData || employeeData.error) {
          throw new Error('Failed to fetch employee data');
        }
        
        // Map backend data to profile format with global general settings
        setProfileData({
          fullName: employeeData.name || '',
          email: employeeData.email || '',
          phone: employeeData.phone || '',
          address: employeeData.address || '',
          employeeId: employeeData.employeeId || '',
          domain: employeeData.domain || '',
          department: employeeData.department || '',
          position: employeeData.position || '',
          hireDate: employeeData.joinDate || '',
          salary: employeeData.salary || '',
          manager: employeeData.manager || '',
          emergencyContact: {
            name: employeeData.emergencyContact?.name || '',
            relationship: employeeData.emergencyContact?.relationship || '',
            phone: employeeData.emergencyContact?.phone || '',
            address: employeeData.emergencyContact?.address || ''
          },
          generalSettings: {
            companyName: generalSettingsData?.companyName || 'TechCorp Solutions',
            workingHoursStart: generalSettingsData?.workingHoursStart || '09:00 AM',
            workingHoursEnd: generalSettingsData?.workingHoursEnd || '05:00 PM'
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching employee data:', err);
        setError('Failed to load employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id || currentUser?.email) {
      fetchEmployeeData();
    } else {
      setError('No user information available');
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.email]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Try to find employee by email if ID doesn't work
      let employeeId = currentUser.id;
      if (!employeeId && currentUser.email) {
        const employeeData = await findEmployeeByEmail(currentUser.email);
        if (employeeData && employeeData._id) {
          employeeId = employeeData._id;
        } else {
          alert('Employee not found. Please contact administrator.');
          return;
        }
      }
      
      if (!employeeId) {
        alert('Employee ID not found. Please contact administrator.');
        return;
      }
      
      // Prepare data for backend
      const updateData = {
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        employeeId: profileData.employeeId,
        domain: profileData.domain,
        department: profileData.department,
        position: profileData.position,
        joinDate: profileData.hireDate,
        salary: profileData.salary,
        manager: profileData.manager,
        emergencyContact: profileData.emergencyContact
        // Note: generalSettings are not included as they are managed globally
      };

      // Update employee data in backend
      const result = await updateProfileData(employeeId, updateData);
      
      if (result && result.error) {
        throw new Error(result.message || 'Failed to update profile');
      }

      console.log('Profile updated successfully');
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(`Failed to update profile: ${err.message}. Please try again.`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload the data from backend
    window.location.reload();
  };

  const canEditField = (fieldName) => {
    if (isAdmin) return true; // Admin can edit everything
    
    // Employee can only edit these fields
    const employeeEditableFields = ['address', 'emergencyContact.name', 'emergencyContact.relationship', 'emergencyContact.phone', 'emergencyContact.address'];
    return employeeEditableFields.includes(fieldName);
  };

  // Helper function to convert 12-hour time to 24-hour format for HTML time input
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    // Manual padding without using padStart
    const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${paddedHours}:${minutes}`;
  };

  // Helper function to convert 24-hour time to 12-hour format for display
  const convertTo12Hour = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${modifier}`;
  };

  if (loading) {
  return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
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
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
          <div className="avatar-circle">
            {profileData.fullName.charAt(0).toUpperCase()}
          </div>
          </div>
          <div className="profile-info">
          <h1 className="profile-name">{profileData.fullName}</h1>
          <p className="profile-role">{isAdmin ? 'Administrator' : 'Employee'}</p>
        </div>
        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
          </div>
          ) : (
          <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
          >
              Edit Profile
          </button>
          )}
        </div>
        </div>

        <div className="profile-sections">
        {/* General Settings */}
        <div className="profile-section">
          <h2 className="section-title">General Settings</h2>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className={`form-input ${!isAdmin ? 'disabled' : ''}`}
                  value={profileData.generalSettings.companyName}
                  onChange={(e) => handleInputChange('generalSettings.companyName', e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Enter company name"
                />
                {!isAdmin && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Working Hours Start</label>
                <div className="input-with-icon">
                  <input
                    type="time"
                    className={`form-input ${!isAdmin ? 'disabled' : ''}`}
                    value={convertTo24Hour(profileData.generalSettings.workingHoursStart)}
                    onChange={(e) => handleInputChange('generalSettings.workingHoursStart', convertTo12Hour(e.target.value))}
                    disabled={!isAdmin}
                    placeholder="Enter start time"
                  />
                  <span className="input-icon">🕐</span>
                </div>
                <small className="field-note">Current: {profileData.generalSettings.workingHoursStart}</small>
                {!isAdmin && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours End</label>
                <div className="input-with-icon">
                  <input
                    type="time"
                    className={`form-input ${!isAdmin ? 'disabled' : ''}`}
                    value={convertTo24Hour(profileData.generalSettings.workingHoursEnd)}
                    onChange={(e) => handleInputChange('generalSettings.workingHoursEnd', convertTo12Hour(e.target.value))}
                    disabled={!isAdmin}
                    placeholder="Enter end time"
                  />
                  <span className="input-icon">🕐</span>
                </div>
                <small className="field-note">Current: {profileData.generalSettings.workingHoursEnd}</small>
                {!isAdmin && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
          <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('fullName') ? 'disabled' : ''}`}
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!canEditField('fullName')}
                  placeholder="Enter full name"
                />
                {!canEditField('fullName') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-input ${!canEditField('email') ? 'disabled' : ''}`}
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!canEditField('email')}
                  placeholder="Enter email address"
                />
                {!canEditField('email') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className={`form-input ${!canEditField('phone') ? 'disabled' : ''}`}
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!canEditField('phone')}
                  placeholder="Enter phone number"
                />
                {!canEditField('phone') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className={`form-input ${!canEditField('address') ? 'disabled' : ''}`}
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!canEditField('address')}
                  placeholder="Enter address"
                  rows="3"
                />
                {!canEditField('address') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('employeeId') ? 'disabled' : ''}`}
                  value={profileData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  disabled={!canEditField('employeeId')}
                  placeholder="Enter employee ID"
                />
                {!canEditField('employeeId') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Domain</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('domain') ? 'disabled' : ''}`}
                  value={profileData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  disabled={!canEditField('domain')}
                  placeholder="Enter domain"
                />
                {!canEditField('domain') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('hireDate') ? 'disabled' : ''}`}
                  value={profileData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  disabled={!canEditField('hireDate')}
                  placeholder="Enter joining date"
                />
                {!canEditField('hireDate') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              </div>
            </div>
          </div>

        {/* Work Information - Admin Only */}
        {isAdmin && (
          <div className="profile-section">
            <h2 className="section-title">Work Information</h2>
            <div className="section-content">
              <div className="form-row">
              <div className="form-group">
                  <label className="form-label">Employee ID</label>
                <input
                  type="text"
                    className="form-input"
                  value={profileData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="Enter employee ID"
                />
              </div>
              <div className="form-group">
                  <label className="form-label">Department</label>
                <input
                  type="text"
                    className="form-input"
                  value={profileData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department"
                />
                </div>
              </div>
              <div className="form-row">
              <div className="form-group">
                  <label className="form-label">Position</label>
                <input
                  type="text"
                    className="form-input"
                  value={profileData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Enter position"
                />
              </div>
              <div className="form-group">
                  <label className="form-label">Hire Date</label>
                <input
                  type="date"
                    className="form-input"
                    value={profileData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="Enter salary"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    placeholder="Enter manager name"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="profile-section">
          <h2 className="section-title">Emergency Contact</h2>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('emergencyContact.name') ? 'disabled' : ''}`}
                  value={profileData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  disabled={!canEditField('emergencyContact.name')}
                  placeholder="Enter contact name"
                />
                {!canEditField('emergencyContact.name') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  className={`form-input ${!canEditField('emergencyContact.relationship') ? 'disabled' : ''}`}
                  value={profileData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  disabled={!canEditField('emergencyContact.relationship')}
                  placeholder="Enter relationship"
                />
                {!canEditField('emergencyContact.relationship') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className={`form-input ${!canEditField('emergencyContact.phone') ? 'disabled' : ''}`}
                  value={profileData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                  disabled={!canEditField('emergencyContact.phone')}
                  placeholder="Enter contact phone"
                />
                {!canEditField('emergencyContact.phone') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Contact Address</label>
                <textarea
                  className={`form-input ${!canEditField('emergencyContact.address') ? 'disabled' : ''}`}
                  value={profileData.emergencyContact.address}
                  onChange={(e) => handleInputChange('emergencyContact.address', e.target.value)}
                  disabled={!canEditField('emergencyContact.address')}
                  placeholder="Enter contact address"
                  rows="3"
                />
                {!canEditField('emergencyContact.address') && (
                  <small className="field-note">Only admin can edit this field</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 