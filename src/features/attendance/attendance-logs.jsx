import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, Search, Clock, Calendar, 
  ShieldAlert, Loader2, Filter, History, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './attendance-logs.css';

export default function AttendanceLogs({ onLogout, user }) {
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Real-Time Table State
  const [rtLogs, setRtLogs] = useState([]);
  const [rtSearch, setRtSearch] = useState('');
  const [rtDebouncedSearch, setRtDebouncedSearch] = useState('');
  const [rtPage, setRtPage] = useState(1);
  const [rtTotalPages, setRtTotalPages] = useState(1);
  const [isRtLoading, setIsRtLoading] = useState(true);
  
  // History Table State
  const [histLogs, setHistLogs] = useState([]);
  const [histSearch, setHistSearch] = useState('');
  const [histDebouncedSearch, setHistDebouncedSearch] = useState('');
  const [histStatus, setHistStatus] = useState('All');
  const [histPage, setHistPage] = useState(1);
  const [histTotalPages, setHistTotalPages] = useState(1);
  const [isHistLoading, setIsHistLoading] = useState(true);

  // Role Control
  const allowedRoles = ['Super Admin', 'HR Admin', 'Department Head'];
  const hasAccess = allowedRoles.includes(user?.role);
  const isGlobal = user?.role === 'HR Admin' || user?.role === 'Super Admin';

  // Debounce Search Inputs
  useEffect(() => {
    const rtTimer = setTimeout(() => {
      setRtDebouncedSearch(rtSearch);
      setRtPage(1); 
    }, 500);
    return () => clearTimeout(rtTimer);
  }, [rtSearch]);

  useEffect(() => {
    const histTimer = setTimeout(() => {
      setHistDebouncedSearch(histSearch);
      setHistPage(1); 
    }, 500);
    return () => clearTimeout(histTimer);
  }, [histSearch]);

  // Fetch Real-Time Data (Limit: 50)
  useEffect(() => {
    if (!hasAccess) return;
    const fetchRealTime = async () => {
      setIsRtLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const deptParam = isGlobal ? '' : `&department=${encodeURIComponent(user?.department || '')}`;
        const searchParam = rtDebouncedSearch ? `&search=${encodeURIComponent(rtDebouncedSearch)}` : '';
        
        const res = await fetch(`${apiUrl}/api/admin/attendance/realtime?page=${rtPage}&limit=50${deptParam}${searchParam}`);
        if (res.ok) {
          const json = await res.json();
          setRtLogs(json.data);
          setRtTotalPages(json.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load realtime logs:", err);
      } finally {
        setIsRtLoading(false);
      }
    };
    fetchRealTime();
  }, [user, hasAccess, isGlobal, rtPage, rtDebouncedSearch]);

  // Fetch History Data (Limit: 50)
  useEffect(() => {
    if (!hasAccess) return;
    const fetchHistory = async () => {
      setIsHistLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const deptParam = isGlobal ? '' : `&department=${encodeURIComponent(user?.department || '')}`;
        const searchParam = histDebouncedSearch ? `&search=${encodeURIComponent(histDebouncedSearch)}` : '';
        const statusParam = histStatus !== 'All' ? `&status=${encodeURIComponent(histStatus)}` : '';
        
        const res = await fetch(`${apiUrl}/api/admin/attendance/history?page=${histPage}&limit=50${deptParam}${searchParam}${statusParam}`);
        if (res.ok) {
          const json = await res.json();
          setHistLogs(json.data);
          setHistTotalPages(json.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load history logs:", err);
      } finally {
        setIsHistLoading(false);
      }
    };
    fetchHistory();
  }, [user, hasAccess, isGlobal, histPage, histDebouncedSearch, histStatus, refreshTrigger]);

  if (!hasAccess) {
    navigate('/dashboard'); 
    return null;
  }

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/admin/attendance/trigger-etl`, { method: 'POST' });
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1); // Tells the useEffect to reload the history table
      }
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderSidebar = () => {
    return isGlobal ? <HrSidebar user={user} /> : <HodSidebar user={user} />;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '—', time: '—' };
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

  // ----------------------------------------------------
  // PAGINATION UI GENERATOR
  // ----------------------------------------------------
  const renderPagination = (currentPage, totalPages, setPageFn) => {
    if (totalPages <= 1) return null;

    // Build a sliding window of 5 pages around the current page
    const pages = [];
    const maxVisible = 5; 
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="al-pagination-footer">
        <div className="al-pagination-group">
          <button 
            className="btn-secondary al-page-arrow" 
            disabled={currentPage === 1} 
            onClick={() => setPageFn(1)}
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button 
            className="btn-secondary al-page-arrow" 
            disabled={currentPage === 1} 
            onClick={() => setPageFn(currentPage - 1)}
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="al-pagination-numbers">
          {startPage > 1 && <span className="al-page-dots">...</span>}
          {pages.map((p) => (
            <button
              key={p}
              className={`al-page-num ${p === currentPage ? 'active' : ''}`}
              onClick={() => setPageFn(p)}
            >
              {p}
            </button>
          ))}
          {endPage < totalPages && <span className="al-page-dots">...</span>}
        </div>

        <div className="al-pagination-group">
          <button 
            className="btn-secondary al-page-arrow" 
            disabled={currentPage === totalPages} 
            onClick={() => setPageFn(currentPage + 1)}
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
          <button 
            className="btn-secondary al-page-arrow" 
            disabled={currentPage === totalPages} 
            onClick={() => setPageFn(totalPages)}
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} style={{ color: 'var(--color-maroon)' }} />
                  <span>Daily Attendance History</span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleForceSync} 
                    disabled={isSyncing}
                    style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} className={isSyncing ? "spin" : ""} />
                    {isSyncing ? "Syncing..." : "Force Sync Now"}
                  </button>

                  <div style={{ position: 'relative' }}>
                    <Filter size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
                    <select 
                      className="app-search-input"
                      style={{ padding: '8px 14px 8px 34px', fontSize: '13px', cursor: 'pointer', width: '140px' }}
                      value={histStatus}
                      onChange={(e) => { setHistStatus(e.target.value); setHistPage(1); }}
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
                      value={histSearch}
                      onChange={(e) => setHistSearch(e.target.value)}
                    />
                  </div>
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
                    {isRtLoading ? (
                      <tr>
                        <td colSpan={isGlobal ? 5 : 4} className="al-empty-state">
                          <Loader2 size={24} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-maroon)' }} />
                          Fetching live logs from database...
                        </td>
                      </tr>
                    ) : rtLogs.length === 0 ? (
                      <tr>
                        <td colSpan={isGlobal ? 5 : 4} className="al-empty-state">
                          <ShieldAlert size={24} style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)' }} />
                          No live punches found.
                        </td>
                      </tr>
                    ) : (
                      rtLogs.map((log, idx) => {
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
              
              {/* Pagination Controls */}
              {!isRtLoading && renderPagination(rtPage, rtTotalPages, setRtPage)}
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
                      value={histStatus}
                      onChange={(e) => { setHistStatus(e.target.value); setHistPage(1); }}
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
                      value={histSearch}
                      onChange={(e) => setHistSearch(e.target.value)}
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
                    {isHistLoading ? (
                      <tr>
                        <td colSpan={isGlobal ? 7 : 6} className="al-empty-state">
                          <Loader2 size={24} className="spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-maroon)' }} />
                          Compiling historical records...
                        </td>
                      </tr>
                    ) : histLogs.length === 0 ? (
                      <tr>
                        <td colSpan={isGlobal ? 7 : 6} className="al-empty-state">
                          <ShieldAlert size={24} style={{ margin: '0 auto 12px auto', color: 'var(--color-text-muted)' }} />
                          No historical attendance records found for this filter.
                        </td>
                      </tr>
                    ) : (
                      histLogs.map((log, idx) => (
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

              {/* Pagination Controls */}
              {!isHistLoading && renderPagination(histPage, histTotalPages, setHistPage)}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}