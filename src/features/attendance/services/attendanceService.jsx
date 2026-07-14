import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

const attendanceService = {
  getAttendanceMetrics: async (employeeKey) => {
    // Append the employee key to match the new backend route
    const response = await API.get(`/attendance/summary/${employeeKey}`);
    return response.data;
  }
};

export default attendanceService;