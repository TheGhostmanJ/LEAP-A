import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  Search, 
  Clock, 
  Calendar, 
  ShieldAlert,
  Loader2,
  Filter,
  History
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './attendance-logs.css';

export default function AttendanceLogs({ onLogout, user }) {
  const navigate = useNavigate();
  
  // State for Real-Time Punches
  const [rawPunches, setRawPunches] = useState([]);
  const [searchPunches, setSearchPunches] = useState('');
  
  // State for Daily Attendance History
  const [historyLogs, setHistoryLogs] = useState([]);
  const [searchHistory, setSearchHistory] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isLoading, setIsLoading] = useState(true);

  // Role-Based Access Control
  const allowedRoles = ['Super Admin', 'HR Admin', 'Department Head'];
  const hasAccess = allowedRoles.includes(user?.role);
  const isGlobal = user?.role === 'HR Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (!hasAccess) {
      navigate('/dashboard'); 
      return;
    }

    const fetchAllLogs = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const deptParam = isGlobal ? '' : `?department=${encodeURIComponent(user?.department || '')}`;
        
        const [punchesRes, historyRes] = await Promise.all([
          fetch(`${apiUrl}/api/attendance/realtime-punches${deptParam}`),
          fetch(`${apiUrl}/api/attendance/logs${deptParam}`)
        ]);
        
        if (punchesRes.ok) setRawPunches(await punchesRes.json());
        if (historyRes.ok) setHistoryLogs(await historyRes.json());
        
      } catch (error) {
        console.error("Failed to load attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchAllLogs();
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
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

  const getPunchBadge = (type) => {
    if (type === 0) return <span className="punch-badge punch-in">Check In</span>;
    if (type === 1) return <span className="punch-badge punch-out">Check Out</span>;
    return <span className="punch-badge punch-other">Unknown</span>;
  };

  // Filter Logic
  const filteredPunches = rawPunches.filter(log => 
    (log.employee_name && log.employee_name.toLowerCase().includes(searchPunches.toLowerCase())) ||
    (log.employee_id && log.employee_id.toLowerCase().includes(searchPunches.toLowerCase()))
  );

  const filteredHistory = historyLogs.filter(log => {
    const matchesSearch = 
      (log.employee_name && log.employee_name.toLowerCase().includes(searchHistory.toLowerCase())) ||
      (log.employee_id && log.employee_id.toLowerCase().includes(searchHistory.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                  <h1 className="app-title">Workforce Attendance</h1>
                  <p className="app-subtitle">
                    {isGlobal ? 'Global Organization Records' : `${user?.department} Records`}
                  </p>
                </div>
              </div>
              <Header user={user} onLogout={onLogout} />
            </header>

            {/* TABLE 1: RAW REAL-TIME PUNCHES */}
            <div className="app-card">
              <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="al-live-indicator"></div>
                  <span>Live Biometric Punches</span>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="app-search-input"
                    style={{ padding: '8px 14px 8px 38px', fontSize: '13px' }}
                    placeholder="Search name or ID..."
                    value={searchPunches}
                    onChange={(e) => setSearchPunches(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="al-data-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Timestamp</th>
                      <th>Employee</th>
                      {isGlobal && <th>Department</th>}
                      <th>Action</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={isGlobal ? 5 : 4} className="al-empty-state">
                          <Loader2 size={24} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-maroon)' }} />
                          Connecting to biometric bridge...
                        </td>
                      </tr>
                    ) : filteredPunches.length === 0 ? (
                      <tr>
                        <td colSpan={isGlobal ? 5 : 4} className="al-empty-state">
                          <ShieldAlert size={24} style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)' }} />
                          No live punches recorded today.
                        </td>
                      </tr>
                    ) : (
                      filteredPunches.map((log, idx) => {
                        const dt = formatDateTime(log.punch_time);
                        return (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{dt.time}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{dt.date}</div>
                            </td>
                            <td>
                              <div className="al-emp-name">{log.employee_name}</div>
                              <div className="al-emp-id">{log.employee_id}</div>
                            </td>
                            {isGlobal && <td><span className="al-dept-badge">{log.department}</span></td>}
                            <td>{getPunchBadge(log.punch_type)}</td>
                            <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{log.source}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: DAILY ATTENDANCE HISTORY */}
            <div className="app-card">
              <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} style={{ color: 'var(--color-maroon)' }} />
                  <span>Daily Attendance History</span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <Filter size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
                    <select 
                      className="app-search-input"
                      style={{ padding: '8px 14px 8px 34px', fontSize: '13px', cursor: 'pointer', width: '140px' }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Present">Present</option>
                      <option value="Tardy">Tardy</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">On Leave</option>
                    </select>
                  </div>

                  <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      className="app-search-input"
                      style={{ padding: '8px 14px 8px 38px', fontSize: '13px' }}
                      placeholder="Search history..."
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                    />
                  </div>
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
                          Compiling historical records...
                        </td>
                      </tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={isGlobal ? 7 : 6} className="al-empty-state">
                          <ShieldAlert size={24} style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)' }} />
                          No historical attendance records found for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((log, idx) => (
                        <tr key={idx}>
                          <td className="al-cell-date">
                            <Calendar size={14} className="al-icon" />
                            {formatDateTime(log.date).date}
                          </td>
                          <td>
                            <div className="al-emp-name">{log.employee_name}</div>
                            <div className="al-emp-id">{log.employee_id}</div>
                          </td>
                          {isGlobal && <td><span className="al-dept-badge">{log.department}</span></td>}
                          <td className="al-cell-time">
                            {log.time_in ? <><Clock size={14} className="al-icon" /> {formatDateTime(log.time_in).time}</> : '—'}
                          </td>
                          <td className="al-cell-time">
                            {log.time_out ? <><Clock size={14} className="al-icon" /> {formatDateTime(log.time_out).time}</> : '—'}
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