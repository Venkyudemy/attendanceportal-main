// Environment-aware API base URL with fallback
const getApiBaseUrl = () => {
  // Check for REACT_APP_API_URL environment variable first
  if (process.env.REACT_APP_API_URL) {
    console.log('Using environment API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative path since NGINX will proxy to backend
    console.log('Using production API URL: /api');
    return '/api';
  }
  
  // Development fallback - use localhost for local development
  console.log('Using development API URL: http://localhost:5000/api');
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls with error handling
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', url);

  try {
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      // Get the error message from the response
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }
      
      // Create a custom error with authentication flag
      const error = new Error(errorMessage);
      if (response.status === 401) {
        error.isAuthError = true;
      }
      throw error;
    }
    
    const data = await response.json();
    console.log('API call successful:', data);
    return data;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    
    // Check if it's a network/connection error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Connection error: Unable to reach the server. Please check your internet connection and try again.');
    }
    
    // Check if it's a Bad Gateway error
    if (error.message.includes('Bad Gateway') || error.message.includes('502')) {
      throw new Error('Server error: Backend service is not responding. Please try again in a few moments.');
    }
    
    // Check if it's an authentication error
    if (error.isAuthError || error.message.includes('Invalid') || error.message.includes('Unauthorized')) {
      throw new Error('Invalid username and password');
    }
    
    // For other errors, throw the original error message
    throw error;
  }
};

// Auth API calls
export const loginUser = async (credentials) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Employee API calls
export const getEmployeeStats = async () => {
  try {
    const data = await apiCall('/employee/stats');
    
    // Provide fallback data if the response is empty or has errors
    if (!data || data.error) {
      console.log('Using fallback employee stats data');
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeave: 0,
        lateArrivals: 0,
        attendanceRate: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    // Return fallback data on error
    return {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      onLeave: 0,
      lateArrivals: 0,
      attendanceRate: 0
    };
  }
};

// Delete employee
export const deleteEmployee = async (employeeId) => {
  return apiCall(`/employee/${employeeId}`, {
    method: 'DELETE',
  });
};

export const getEmployeeAttendance = async () => {
  try {
    const data = await apiCall('/employee/attendance');
    
    if (!data || data.error) {
      console.log('Using fallback attendance data');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return [];
  }
};

export const getEmployeeById = async (employeeId) => {
  return apiCall(`/employee/details/${employeeId}`);
};

export const getEmployeeLeaveBalance = async (employeeId) => {
  return apiCall(`/employee/${employeeId}/leave-balance`);
};

export const recalculateEmployeeLeaveBalance = async (employeeId) => {
  return apiCall(`/employee/${employeeId}/recalculate-leave-balance`, {
    method: 'POST',
  });
};

export const syncAllEmployeesLeaveBalanceStructure = async () => {
  return apiCall('/employee/admin/sync-leave-balance-structure', {
    method: 'POST',
  });
};

export const updateEmployee = async (employeeId, employeeData) => {
  return apiCall(`/employee/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
};

export const createEmployee = async (employeeData) => {
  return apiCall('/employee', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

export const findEmployeeByEmail = async (email) => {
  return apiCall(`/employee/find-by-email/${encodeURIComponent(email)}`);
};

export const getEmployeePortalData = async (employeeId) => {
  return apiCall(`/employee/${employeeId}/portal-data`);
};

export const getTodayHoliday = async () => {
  return apiCall('/employee/today-holiday');
};

export const checkInEmployee = async (employeeId, checkInData) => {
  return apiCall(`/employee/${employeeId}/check-in`, {
    method: 'POST',
    body: JSON.stringify(checkInData),
  });
};

export const checkOutEmployee = async (employeeId, checkOutData) => {
  return apiCall(`/employee/${employeeId}/check-out`, {
    method: 'POST',
    body: JSON.stringify(checkOutData),
  });
};

export const getEmployeeAttendanceDetails = async (employeeId, month, year) => {
  return apiCall(`/employee/${employeeId}/attendance-details?month=${month}&year=${year}`);
};

// Admin API calls
export const getAdminRecentActivities = async (limit = 5) => {
  try {
    const data = await apiCall(`/employee/admin/recent-activities?limit=${limit}`);
    
    if (!data || data.error) {
      console.log('Using fallback admin recent activities data');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching admin recent activities:', error);
    return [];
  }
};

export const getAdminTotalEmployees = async () => {
  return apiCall('/employee/admin/total');
};

export const getAdminPresentEmployees = async () => {
  return apiCall('/employee/admin/present');
};

export const getAdminLateEmployees = async () => {
  return apiCall('/employee/admin/late');
};

export const getAdminAbsentEmployees = async () => {
  return apiCall('/employee/admin/absent');
};

export const getAdminEmployeesOnLeave = async () => {
  return apiCall('/employee/admin/leave');
};

export const calculatePayroll = async (queryParams) => {
  return apiCall(`/employee/payroll/calculate?${queryParams}`);
};

export const exportPayroll = async (queryParams) => {
  const url = `${getApiBaseUrl()}/employee/payroll/export?${queryParams}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  // For CSV export, return the text content directly
  return await response.text();
};

// Leave API calls
export const createLeaveRequest = async (leaveData) => {
  return apiCall('/leave-requests', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
};

export const getEmployeeLeaveRequests = async (employeeId) => {
  return apiCall(`/leave-requests/employee/${employeeId}`);
};

export const getAllLeaveRequests = async () => {
  return apiCall('/leave-requests');
};

export const getAdminLeaveEmployees = async () => {
  return apiCall('/leave/admin/employees');
};

export const getAdminLeaveStats = async () => {
  return apiCall('/leave-requests/stats');
};

export const createAdminLeaveRequest = async (leaveData) => {
  return apiCall('/leave-requests', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
};

export const updateLeaveRequestStatus = async (requestId, statusData) => {
  console.log('🔄 Updating leave request status:', { requestId, statusData });
  
  try {
    const url = `${getApiBaseUrl()}/leave-requests/${requestId}/status`;
    console.log('🔄 Making PUT request to:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });
    
    console.log('🔄 PUT response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PUT request failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Leave status update successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Leave status update failed:', error);
    throw error;
  }
};

export const deleteLeaveRequest = async (requestId) => {
  return apiCall(`/leave-requests/${requestId}`, {
    method: 'DELETE',
  });
};

export const getLeaveRequestStats = async () => {
  return apiCall('/leave-requests/stats');
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health');
};

// Additional API functions for components still using hardcoded URLs
export const getEmployeeAttendanceView = async (employeeId) => {
  return apiCall(`/employee/${employeeId}`);
};

export const getEmployeeManagementData = async () => {
  return apiCall('/employee/attendance');
};

export const getEmployeeManagementById = async (employeeId) => {
  return apiCall(`/employee/${employeeId}`);
};

export const createEmployeeManagement = async (employeeData) => {
  return apiCall('/employee', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

export const updateEmployeeManagement = async (employeeId, employeeData) => {
  return apiCall(`/employee/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
};

export const getProfileData = async (employeeId) => {
  return apiCall(`/employee/${employeeId}`);
};

export const updateProfileData = async (employeeId, profileData) => {
  return apiCall(`/employee/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const getAttendanceDetailsByEmail = async (email) => {
  return apiCall(`/employee/find-by-email/${encodeURIComponent(email)}`);
};

export const getAttendanceDetailsById = async (employeeId, month, year) => {
  return apiCall(`/employee/${employeeId}/attendance-details?month=${month}&year=${year}`);
};

// Settings API calls
export const getSettings = async () => {
  return apiCall('/settings');
};

export const updateSettings = async (settingsData) => {
  return apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
};

export const getGeneralSettings = async () => {
  return apiCall('/settings/general');
};

export const updateGeneralSettings = async (generalSettings) => {
  return apiCall('/settings/general', {
    method: 'PUT',
    body: JSON.stringify(generalSettings),
  });
};

// Leave Types API calls
export const getLeaveTypes = async () => {
  return apiCall('/settings/leave-types');
};

export const updateLeaveTypes = async (leaveTypes) => {
  return apiCall('/settings/leave-types', {
    method: 'PUT',
    body: JSON.stringify({ leaveTypes }),
  });
}; 