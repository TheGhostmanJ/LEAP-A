import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  Search, 
  Clock, 
  Calendar, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './attendance-logs.css';

export default function AttendanceLogs({ onLogout, user }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Role-Based Access Control
  const allowedRoles = ['Super Admin', 'HR Admin', 'Department Head'];
  const hasAccess = allowedRoles.includes(user?.role);
  const isGlobal = user?.role === 'HR Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (!hasAccess) {
      navigate('/dashboard'); // Redirect unauthorized users
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // HR/Super Admin pass empty string for global data. HODs pass their specific department.
        const deptParam = isGlobal ? '' : `?department=${encodeURIComponent(user?.department || '')}`;
        
        const response = await fetch(`${apiUrl}/api/attendance/logs${deptParam}`);
        
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to load attendance logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchLogs();
  }, [user, hasAccess, isGlobal, navigate]);

  const renderSidebar = () => {
    switch (user?.role) {
      case 'HR Admin':
      case 'Super Admin':
        return <HrSidebar user={user} />;
      case 'Department Head':
      default:
        return <HodSidebar user={user} />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'status-success';
      case 'tardy': return 'status-warning';
      case 'absent': return 'status-danger';
      case 'leave': return 'status-info';
      default: return 'status-info';
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLogs = logs.filter(log => 
    (log.employee_name && log.employee_name.toLowerCase().includes(normalizedQuery)) ||
    (log.employee_id && log.employee_id.toLowerCase().includes(normalizedQuery)) ||
    (log.department && log.department.toLowerCase().includes(normalizedQuery))
  );

  if (!hasAccess) return null;

  return (
    <div className="app-layout-wrapper">
      {renderSidebar()}

      <div className="app-main-container">
        <main className="app-main-content fade-in-up">
          <div className="app-page">
            
            <header className="app-global-header">
              <div className="app-title-layout">
                <div className="app-title-icon-badge">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <h1 className="app-title">Real-Time Attendance</h1>
                  <p className="app-subtitle">
                    {isGlobal ? 'Global Organization Logs' : `${user?.department} Logs`}
                  </p>
                </div>
              </div>
              <Header user={user} onLogout={onLogout} />
            </header>

            <div className="app-card">
              <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ZKTeco Biometric Sync Logs</span>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="app-search-input"
                    placeholder="Search name, ID, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive-scroll">
                <table className="al-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee</th>
                      {isGlobal && <th>Department</th>}
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Total Hours</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={isGlobal ? 7 : 6} className="al-empty-state">
                          <Loader2 size={24} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-maroon)' }} />
                          Fetching live logs from database...
                        </td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={isGlobal ? 7 : 6} className="al-empty-state">
                          <ShieldAlert size={24} style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)' }} />
                          No attendance records found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td className="al-cell-date">
                            <Calendar size={14} className="al-icon" />
                            {formatDate(log.date)}
                          </td>
                          <td>
                            <div className="al-emp-name">{log.employee_name}</div>
                            <div className="al-emp-id">{log.employee_id}</div>
                          </td>
                          {isGlobal && <td><span className="al-dept-badge">{log.department}</span></td>}
                          <td className="al-cell-time">
                            {log.time_in ? <><Clock size={14} className="al-icon" /> {formatTime(log.time_in)}</> : '—'}
                          </td>
                          <td className="al-cell-time">
                            {log.time_out ? <><Clock size={14} className="al-icon" /> {formatTime(log.time_out)}</> : '—'}
                          </td>
                          <td>
                            {log.hours_worked > 0 ? <strong>{log.hours_worked}h</strong> : '—'}
                          </td>
                          <td className="text-center">
                            <span className={`app-status-badge ${getStatusClass(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}