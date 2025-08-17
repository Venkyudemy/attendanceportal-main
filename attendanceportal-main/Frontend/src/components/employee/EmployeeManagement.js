import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeManagement.css';
import { 
  getEmployeeStats, 
  getEmployeePortalData, 
  deleteEmployee,
  getEmployeeAttendance,
  createEmployee,
  updateEmployee
} from '../../services/api';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    joinDate: '',
    password: '',
    employeeId: '',
    domain: ''
  });

  // Fetch employee data from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeAttendance();
        console.log('Fetched employees:', data);
        
        // Ensure data is an array and has the expected structure
        if (Array.isArray(data)) {
          setEmployees(data);
          setError(null);
        } else {
          console.error('Invalid data format received:', data);
          setError('Invalid data format received from server');
          setEmployees([]);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployee = await updateEmployee(editingEmployee.id, {
          ...formData,
          employeeId: formData.employeeId || '',
          domain: formData.domain || ''
        });
        
        // Update local state
        setEmployees(employees.map(emp => 
          emp.id === editingEmployee.id 
            ? updatedEmployee
            : emp
        ));
        setEditingEmployee(null);
      } else {
        // Add new employee
        const newEmployee = await createEmployee({
          ...formData,
          employeeId: formData.employeeId || `EMP${Date.now()}`,
          domain: formData.domain || ''
        });
        
        console.log('New employee response:', newEmployee);
        setEmployees([...employees, newEmployee]);
        
        // Automatically navigate to the new employee's profile
        alert('Employee added successfully! Redirecting to employee profile...');
        navigate(`/profile`, { 
          state: { 
            newEmployeeId: newEmployee._id,
            showProfile: true 
          } 
        });
      }
      
      setFormData({
        name: '',
        email: '',
        department: '',
        position: '',
        phone: '',
        joinDate: '',
        password: '',
        employeeId: '',
        domain: ''
      });
      setShowAddForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      console.error('Error details:', error.message);
      alert(`Failed to save employee: ${error.message}. Please check if the backend server is running.`);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    
    // Format join date for the date input field
    let formattedJoinDate = '';
    if (employee.joinDate) {
      // If joinDate is a string in MM/DD/YYYY format, convert to YYYY-MM-DD
      if (typeof employee.joinDate === 'string') {
        if (employee.joinDate.includes('/')) {
          // Convert MM/DD/YYYY to YYYY-MM-DD
          const parts = employee.joinDate.split('/');
          if (parts.length === 3) {
            formattedJoinDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          } else {
            formattedJoinDate = employee.joinDate;
          }
        } else {
          formattedJoinDate = employee.joinDate;
        }
      } else if (employee.joinDate instanceof Date) {
        formattedJoinDate = employee.joinDate.toISOString().split('T')[0];
      }
    }
    
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      phone: employee.phone,
      joinDate: formattedJoinDate,
      password: '', // Don't show existing password for security
      employeeId: employee.employeeId || '',
      domain: employee.domain || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        // Call backend API to delete employee using the API service
        await deleteEmployee(id);
        
        // Remove from local state only after successful backend deletion
        setEmployees(employees.filter(emp => emp.id !== id));
        console.log('Employee deleted successfully from backend');
        // Show success message
        alert('Employee deleted successfully!');
        
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(`Failed to delete employee: ${error.message}. Please try again.`);
      }
    }
  };

  const handleViewEmployeePortal = (employee) => {
    // Navigate to employee details page
    navigate(`/employee/${employee.id}`);
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'On Leave': return 'info';
      default: return 'secondary';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    (employee.name && employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="employee-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-management">
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
    <div className="employee-management">
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <p className="page-subtitle">Manage your team members and their information.</p>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingEmployee(null);
            setFormData({
              name: '',
              email: '',
              department: '',
              position: '',
              phone: '',
              joinDate: '',
              password: ''
            });
          }}
        >
          Add Employee
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEmployee(null);
                  setFormData({
                    name: '',
                    email: '',
                    department: '',
                    position: '',
                    phone: '',
                    joinDate: '',
                    password: '',
                    employeeId: '',
                    domain: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="form-group">
                  <label>Domain</label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="Enter domain"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    required={!editingEmployee}
                    placeholder="Select join date"
                  />
                  {editingEmployee && (
                    <small className="field-hint">Leave empty to keep current join date</small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingEmployee ? "Leave blank to keep current password" : "Enter employee password"}
                    required={!editingEmployee}
                  />
                  <small className="field-hint">Admin only: Set initial password for employee login</small>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => {
                  setShowAddForm(false);
                  setEditingEmployee(null);
                  setFormData({
                    name: '',
                    email: '',
                    department: '',
                    position: '',
                    phone: '',
                    joinDate: '',
                    password: '',
                    employeeId: '',
                    domain: ''
                  });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="employee-table">
        {filteredEmployees.length === 0 ? (
          <div className="no-employees">
            <p>No employees found. {searchTerm ? 'Try adjusting your search.' : 'Add your first employee to get started.'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Attendance Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {employee.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="employee-name">{employee.name || 'Unknown'}</div>
                        <div className="employee-phone">{employee.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{employee.email || 'No email'}</td>
                  <td>
                    <span className="department-badge">{employee.department || 'Unknown'}</span>
                  </td>
                  <td>{employee.position || 'Unknown'}</td>
                  <td>
                    <span className={`status-badge ${getAttendanceStatusColor(employee.attendance?.status || 'Unknown')}`}>
                      {employee.attendance?.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{employee.attendance?.checkIn || 'Not checked in'}</td>
                  <td>{employee.attendance?.checkOut || 'Not checked out'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleViewEmployeePortal(employee)}
                        title="View Employee Portal"
                      >
                        👤 Portal
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement; 