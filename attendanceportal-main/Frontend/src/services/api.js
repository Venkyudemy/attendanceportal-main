// Environment-aware API base URL with fallback
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Try Docker service name first, then fallback to localhost
    return 'http://backend:5000/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls with error handling and retry logic
const apiCall = async (endpoint, options = {}) => {
  const urls = [
    `${API_BASE_URL}${endpoint}`,
    `http://localhost:5000/api${endpoint}`,  // Fallback for local testing
    `http://127.0.0.1:5000/api${endpoint}`   // Another fallback
  ];

  for (const url of urls) {
    try {
      console.log(`Trying API call to: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      // Continue to next URL if this one fails
      continue;
    }
  }
  
  // If all URLs fail, throw error
  throw new Error('Failed to fetch. Please check if the backend server is running.');
};

// Auth API calls
export const loginUser = async (credentials) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerUser = async (userData) => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
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
  return apiCall(`/employee/${employeeId}`);
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
  return apiCall(`/employee/payroll/export?${queryParams}`);
};

// Leave API calls
export const createLeaveRequest = async (leaveData) => {
  return apiCall('/leave', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
};

export const getEmployeeLeaveRequests = async (employeeId) => {
  return apiCall(`/leave/employee/${employeeId}`);
};

export const getAllLeaveRequests = async () => {
  return apiCall('/leave/admin');
};

export const getAdminLeaveEmployees = async () => {
  return apiCall('/leave/admin/employees');
};

export const getAdminLeaveStats = async () => {
  return apiCall('/leave/admin/stats');
};

export const createAdminLeaveRequest = async (leaveData) => {
  return apiCall('/leave/admin/create', {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
};

export const updateLeaveRequestStatus = async (requestId, statusData) => {
  return apiCall(`/leave/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

export const deleteLeaveRequest = async (requestId) => {
  return apiCall(`/leave/${requestId}`, {
    method: 'DELETE',
  });
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