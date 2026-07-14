import { useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';

export const useAttendance = (employeeKey) => {
  const [data, setData] = useState({ presentDays: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Safeguard: Do not fetch if the user session hasn't loaded yet
    if (!employeeKey) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await attendanceService.getAttendanceMetrics(employeeKey);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeKey]);

  return { data, loading, error };
};