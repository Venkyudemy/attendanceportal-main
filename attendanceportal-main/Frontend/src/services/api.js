const API_BASE_URL = 'http://localhost:5000/api';

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