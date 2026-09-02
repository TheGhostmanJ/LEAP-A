import axios from 'axios';

// 1. Define the dynamic base URL just like in authService
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 2. Inject it into the Axios instance
const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

const attendanceService = {
  getAttendanceMetrics: async (employeeKey) => {
    // Append the employee key to match the new backend route
    const response = await API.get(`/attendance/summary/${employeeKey}`);
    return response.data;
  }
};

export default attendanceService;