import React from 'react';
import ItSidebar from '../../components/it-sidebar';
import { Bell, Database, HardDrive, Activity, RefreshCw } from 'lucide-react';

export default function DatabaseMetrics({ onLogout, user }) {
  const dbTables = [
    { name: 'fact_attendance', rows: '1,245,030', size: '142 MB', bloat: '2.1%' },
    { name: 'fact_leave_application', rows: '32,150', size: '18 MB', bloat: '1.5%' },
    { name: 'dim_employee', rows: '1,450', size: '2 MB', bloat: '0.4%' },
    { name: 'dim_event', rows: '412', size: '1.2 MB', bloat: '0.1%' }
  ];

  return (
    <div className="dashboard-container hod-view-wrapper">
      <ItSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Database size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Database Metrics</h2>
              <p className="subtitle-department">Environment: <span className="highlight-maroon">PostgreSQL Production</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
            </button>
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Super Admin'}</span>
            </div>
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        <section className="forecast-summary-metrics-row" style={{ marginTop: '24px' }}>
          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><Activity size={16} className="inline-icon" /> Active Connections</span>
              <span className="stat-subtext-label">Current pool usage</span>
            </div>
            <div className="stat-right-numbers text-dark-value">48 / 100</div>
          </div>
          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><HardDrive size={16} className="inline-icon" /> Total Storage</span>
              <span className="stat-subtext-label">Data + Indexes</span>
            </div>
            <div className="stat-right-numbers text-green-value">1.4 GB</div>
          </div>
          <div className="forecast-stat-card" style={{ flex: 0.5, display: 'flex', justifyContent: 'center' }}>
            <button className="action-btn-investigate" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <RefreshCw size={16} /> Run Vacuum
            </button>
          </div>
        </section>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar">Top Schema Tables by Size</div>
          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Table Name</th>
                  <th>Estimated Row Count</th>
                  <th>Total Size</th>
                  <th>Index Bloat</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dbTables.map((tbl, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{tbl.name}</td>
                    <td>{tbl.rows}</td>
                    <td style={{ color: '#4b5563' }}>{tbl.size}</td>
                    <td>{tbl.bloat}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-badge status-approved">Healthy</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}