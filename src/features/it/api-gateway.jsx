import React from 'react';
import ItSidebar from '../../components/it-sidebar';
import { Bell, Terminal, Search, Clock, AlertCircle } from 'lucide-react';

export default function ApiGateway({ onLogout, user }) {
  const logs = [
    { time: '14:02:11', method: 'GET', endpoint: '/api/employee/leave-balance', status: 200, latency: '45ms' },
    { time: '14:01:55', method: 'POST', endpoint: '/api/ml/forecast/workforce', status: 200, latency: '820ms' },
    { time: '14:01:12', method: 'POST', endpoint: '/api/ml/anomaly-detect', status: 200, latency: '1.2s' },
    { time: '13:59:44', method: 'PUT', endpoint: '/api/profile/update', status: 403, latency: '12ms' },
    { time: '13:55:10', method: 'GET', endpoint: '/api/reports/department/D02', status: 200, latency: '110ms' },
  ];

  return (
    <div className="dashboard-container hod-view-wrapper">
      <ItSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Terminal size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>API Gateway Log</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">IT Operations</span></p>
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

        <div className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper" style={{ width: '300px' }}>
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Filter endpoint (e.g., /api/ml/)" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
              <Clock size={14} /> Auto-refreshing every 5s
            </span>
          </div>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar" style={{ backgroundColor: '#111827' }}>
            Live Traffic Monitor
          </div>
          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th>Endpoint Path</th>
                  <th>Response Code</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td style={{ color: '#6b7280', fontSize: '12px' }}>{log.time}</td>
                    <td>
                      <span style={{ 
                        fontWeight: '700', 
                        color: log.method === 'GET' ? '#0284c7' : log.method === 'POST' ? '#059669' : '#d97706',
                        fontSize: '12px' 
                      }}>
                        {log.method}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#1f2937' }}>{log.endpoint}</td>
                    <td>
                      <span style={{ 
                        fontWeight: '700', 
                        color: log.status === 200 ? '#059669' : '#dc2626'
                      }}>
                        {log.status} {log.status !== 200 && <AlertCircle size={12} style={{ display: 'inline', marginBottom: '-2px' }}/>}
                      </span>
                    </td>
                    <td style={{ color: log.latency.includes('s') && !log.latency.includes('ms') ? '#dc2626' : '#4b5563' }}>
                      {log.latency}
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