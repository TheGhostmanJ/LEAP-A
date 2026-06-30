import { useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';

export const useAttendance = () => {
  const [data, setData] = useState({ presentDays: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await attendanceService.getAttendanceMetrics();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};