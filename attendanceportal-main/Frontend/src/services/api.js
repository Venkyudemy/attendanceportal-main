const API_BASE_URL = 'http://backend:5000/api';

// Auth API calls
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Employee API calls
export const getEmployeeStats = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/stats`);
  return response.json();
};

export const getEmployeeAttendance = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/attendance`);
  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/employee/admin/recent-activities?limit=${limit}`);
  return response.json();
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