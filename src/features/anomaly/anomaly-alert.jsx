import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  X,
  Loader2,
  Cpu // Added a cool AI chip icon for the button
} from 'lucide-react';

/* SIDEBAR & HEADER COMPONENTS */
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';

import './anomaly-alert.css';

export default function AnomalyAlert({ onLogout, user }) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ totalFlagged: 0, highRisk: 0, resolvedThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false); // NEW: Track ML Scan status
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const deptQuery = user?.role === 'HR Admin' || user?.role === 'Super Admin' 
        ? '' 
        : `?department=${encodeURIComponent(user?.department || '')}`;

      const response = await fetch(`${apiUrl}/api/anomalies${deptQuery}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAnomalies();
  }, [user]);

  // NEW: Function to trigger the Python Machine Learning Scan
  const handleRunAIScan = async () => {
    setIsScanning(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/anomalies/run-ai-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.message); // Show HR the results ("Scan complete. Found X anomalies.")
        fetchAnomalies();    // Refresh the table to show the newly caught employees!
      } else {
        alert(`Scan failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error running AI scan:', error);
      alert('Failed to communicate with the ML Engine.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = async (alertId, actionStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/anomalies/${alertId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionStatus })
      });

      if (response.ok) {
        // Refresh table to reflect the new status
        fetchAnomalies();
      } else {
        alert(`Failed to mark alert as ${actionStatus}`);
      }
    } catch (error) {
      console.error(`Error updating alert status:`, error);
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    alert.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.anomaly_pattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="aa-dashboard-container">
      {/* Navigation Column */}
      {renderSidebar()}

      {/* Main Viewport Content Area */}
      <main className="aa-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="aa-header-row">
          <div className="aa-title-wrapper">
            <AlertOctagon size={28} className="aa-icon-maroon" /> 
            <div className="aa-title-text">
              <h2>
                <span className="aa-title-dark">Anomaly</span> <span className="aa-title-maroon">Alerts</span>
              </h2>
              <p className="aa-subtitle">
                Department: <span className="aa-highlight-maroon">{user?.role === 'HR Admin' ? 'All Departments' : user?.department || 'Unassigned'}</span>
              </p>
            </div>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* SUMMARY CARDS METRICS GRID */}
        <section className="aa-metrics-grid">
          <div className="aa-stat-card">
            <div className="aa-stat-info">
              <span className="aa-stat-label">
                <ShieldAlert size={16} className="aa-inline-icon maroon" /> Total Flagged Alerts
              </span>
            </div>
            <div className="aa-stat-number-row">
              <span className="aa-stat-number text-maroon">{stats.totalFlagged}</span> 
              <span className="aa-stat-unit">Alerts</span>
            </div>
            <div className="aa-progress-bar-bg">
              <div className="aa-progress-bar-fill maroon-fill" style={{ width: `${Math.min((stats.totalFlagged / 50) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="aa-stat-card">
            <div className="aa-stat-info">
              <span className="aa-stat-label">
                <ShieldAlert size={16} className="aa-inline-icon red" /> High Risk Employees
              </span>
            </div>
            <div className="aa-stat-number-row">
              <span className="aa-stat-number text-dark">{stats.highRisk}</span> 
              <span className="aa-stat-unit">Profiles</span>
            </div>
            <div className="aa-progress-bar-bg">
              <div className="aa-progress-bar-fill red-fill" style={{ width: `${Math.min((stats.highRisk / 20) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="aa-stat-card">
            <div className="aa-stat-info">
              <span className="aa-stat-label">
                <CheckCircle size={16} className="aa-inline-icon green" /> Resolved This Month
              </span>
            </div>
            <div className="aa-stat-number-row">
              <span className="aa-stat-number text-green">{stats.resolvedThisMonth}</span> 
              <span className="aa-stat-unit">Profiles</span>
            </div>
            <div className="aa-progress-bar-bg">
              <div className="aa-progress-bar-fill green-fill" style={{ width: `${Math.min((stats.resolvedThisMonth / 50) * 100, 100)}%` }}></div>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="aa-controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="aa-search-wrapper">
              <Search size={18} className="aa-search-icon" />
              <input 
                type="text" 
                placeholder="Search employee or anomaly pattern..." 
                className="aa-search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className="aa-filter-btn" aria-label="Filter records">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* NEW: RUN ML SCAN BUTTON */}
          <button 
            type="button" 
            onClick={handleRunAIScan}
            disabled={isScanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isScanning ? '#9ca3af' : '#800000',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isScanning ? <Loader2 size={18} className="spin" /> : <Cpu size={18} />}
            {isScanning ? 'Running Isolation Forest...' : 'Run ML Security Scan'}
          </button>
        </div>

        {/* FLAGGED ANOMALY RECORDS TABLE */}
        <div className="aa-card-box">
          <div className="aa-card-header">
            <h3>Flagged Anomaly Records</h3>
          </div>

          <div className="aa-table-wrapper">
            <table className="aa-data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Anomaly Pattern</th>
                  <th>Risk Score</th>
                  <th>Date Flagged</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No active anomalies detected. Click "Run ML Security Scan" to analyze behavior.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(alert => (
                    <tr key={alert.alert_id}>
                      <td className="aa-td-bold">{alert.employee_name}</td>
                      <td>{alert.anomaly_pattern}</td>
                      <td>
                        <span className={`aa-risk-pill ${alert.risk_score >= 0.75 ? 'high' : 'medium'}`}>
                          {alert.risk_score} {alert.risk_score >= 0.75 ? 'HIGH' : 'MED'}
                        </span>
                      </td>
                      <td>
                        {new Date(alert.flagged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="text-center">
                        {alert.status === 'Investigating' ? (
                          <div className="aa-action-btn-group" style={{ justifyContent: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', padding: '6px 12px', backgroundColor: '#ecfdf5', borderRadius: '4px' }}>
                              Investigating
                            </span>
                            <button 
                              type="button" 
                              className="aa-btn-dismiss"
                              onClick={() => handleAction(alert.alert_id, 'Resolved')}
                            >
                              <CheckCircle size={14} /> Resolve
                            </button>
                          </div>
                        ) : (
                          <div className="aa-action-btn-group">
                            <button 
                              type="button" 
                              className="aa-btn-investigate"
                              onClick={() => handleAction(alert.alert_id, 'Investigating')}
                            >
                              Investigate <ArrowRight size={14} />
                            </button>
                            <button 
                              type="button" 
                              className="aa-btn-dismiss"
                              onClick={() => handleAction(alert.alert_id, 'Dismissed')}
                            >
                              <X size={14} /> Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}