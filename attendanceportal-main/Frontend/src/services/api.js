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
    const response = await fetch(`${API_BASE_URL}/employee/stats`);
    const data = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/employee/attendance`);
    const data = await response.json();
    
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
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
  return response.json();
};

export const updateEmployee = async (employeeId, employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return response.json();
};

export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return response.json();
};

export const findEmployeeByEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/employee/find-by-email/${encodeURIComponent(email)}`);
  return response.json();
};

export const getEmployeePortalData = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/portal-data`);
  return response.json();
};

export const checkInEmployee = async (employeeId, checkInData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkInData),
  });
  return response.json();
};

export const checkOutEmployee = async (employeeId, checkOutData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkOutData),
  });
  return response.json();
};

export const getEmployeeAttendanceDetails = async (employeeId, month, year) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/attendance-details?month=${month}&year=${year}`);
  return response.json();
};

// Admin API calls
export const getAdminRecentActivities = async (limit = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/admin/recent-activities?limit=${limit}`);
    const data = await response.json();
    
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
  const response = await fetch(`${API_BASE_URL}/employee/admin/total`);
  return response.json();
};

export const getAdminPresentEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/admin/present`);
  return response.json();
};

export const getAdminLateEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/admin/late`);
  return response.json();
};

export const getAdminAbsentEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/admin/absent`);
  return response.json();
};

export const getAdminEmployeesOnLeave = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/admin/leave`);
  return response.json();
};

export const calculatePayroll = async (queryParams) => {
  const response = await fetch(`${API_BASE_URL}/employee/payroll/calculate?${queryParams}`);
  return response.json();
};

export const exportPayroll = async (queryParams) => {
  const response = await fetch(`${API_BASE_URL}/employee/payroll/export?${queryParams}`);
  return response.json();
};

// Leave API calls
export const createLeaveRequest = async (leaveData) => {
  const response = await fetch(`${API_BASE_URL}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });
  return response.json();
};

export const getEmployeeLeaveRequests = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/leave/employee/${employeeId}`);
  return response.json();
};

export const getAllLeaveRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/leave/admin`);
  return response.json();
};

export const getAdminLeaveEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/leave/admin/employees`);
  return response.json();
};

export const getAdminLeaveStats = async () => {
  const response = await fetch(`${API_BASE_URL}/leave/admin/stats`);
  return response.json();
};

export const createAdminLeaveRequest = async (leaveData) => {
  const response = await fetch(`${API_BASE_URL}/leave/admin/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });
  return response.json();
};

export const updateLeaveRequestStatus = async (requestId, statusData) => {
  const response = await fetch(`${API_BASE_URL}/leave/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });
  return response.json();
};

export const deleteLeaveRequest = async (requestId) => {
  const response = await fetch(`${API_BASE_URL}/leave/${requestId}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};

// Additional API functions for components still using hardcoded URLs
export const getEmployeeAttendanceView = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
  return response.json();
};

export const getEmployeeManagementData = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/attendance`);
  return response.json();
};

export const getEmployeeManagementById = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
  return response.json();
};

export const createEmployeeManagement = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return response.json();
};

export const updateEmployeeManagement = async (employeeId, employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return response.json();
};

export const getProfileData = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
  return response.json();
};

export const updateProfileData = async (employeeId, profileData) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  return response.json();
};

export const getAttendanceDetailsByEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/employee/find-by-email/${encodeURIComponent(email)}`);
  return response.json();
};

export const getAttendanceDetailsById = async (employeeId, month, year) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/attendance-details?month=${month}&year=${year}`);
  return response.json();
}; 