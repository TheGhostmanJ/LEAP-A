import axios from 'axios';

// Assuming you have a standard base URL setup
const API = axios.create({ baseURL: 'http://localhost:3001/api' });

const attendanceService = {
  getAttendanceMetrics: async () => {
    // This maps to your Node.js backend route
    const response = await API.get('/attendance/summary');
    return response.data;
  }
};

export default attendanceService;