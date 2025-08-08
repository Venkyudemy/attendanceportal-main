import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee details from backend
        const response = await fetch(`http://localhost:5000/api/employee/${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }
        const employeeData = await response.json();
        
        // Map backend data to profile format
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
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchEmployeeData();
    }
  }, [currentUser?.id]);

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
      };

      // Update employee data in backend
      const response = await fetch(`http://localhost:5000/api/employee/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      console.log('Profile updated successfully');
    setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
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