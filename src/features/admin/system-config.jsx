import React from 'react';
import Sidebar from '../../components/it-sidebar.jsx'; // You can create a distinct SuperAdminSidebar later
import { Bell, Server, Database, Shield, Terminal, Users, RefreshCw, Settings } from 'lucide-react';
import './system-config.css'; // Create a quick CSS file for custom colors if needed

export default function SystemConfig({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      <Sidebar />

      <div className="dashboard-main-content">
        
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Server size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>System Configuration</h2>
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

        {/* METRICS ROW */}
        <section className="forecast-summary-metrics-row">
          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><Database size={16} className="inline-icon" /> DB Status</span>
              <span className="stat-subtext-label">PostgreSQL 14.0</span>
            </div>
            <div className="stat-right-numbers text-green-value">Online</div>
          </div>
          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><Terminal size={16} className="inline-icon" /> API Gateway</span>
              <span className="stat-subtext-label">Active Connections</span>
            </div>
            <div className="stat-right-numbers text-dark-value">42</div>
          </div>
        </section>

        {/* MAIN IT TOOLS GRID */}
        <section className="forecast-grid-split" style={{ marginTop: '20px' }}>
          
          {/* Left Column: Access Control */}
          <div className="forecast-left-column">
            <div className="content-data-box table-box-margin card-shadow-wrap">
              <div className="box-header-title-maroon-bar">
                <Shield size={16} style={{ marginRight: '8px' }}/> Role Management (RBAC)
              </div>
              <div className="table-responsive-scroll" style={{ padding: '20px' }}>
                <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
                  Manage system_access_level variables for Lipa City personnel accounts.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="primary-action-trigger-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                    <Users size={16} /> Audit User Roles
                  </button>
                  <button className="action-btn-investigate" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Settings size={16} /> Configure Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Maintenance */}
          <div className="forecast-right-column">
            <div className="content-data-box paddingless-box shadow-card">
              <div className="box-header-title">System Maintenance</div>
              <div className="alert-list-wrapper">
                <div className="alert-item-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RefreshCw size={18} style={{ color: '#4a5568' }} />
                    <span style={{ fontWeight: '500', color: '#2d3748' }}>Clear Server Cache</span>
                  </div>
                  <button className="action-btn-green" style={{ padding: '6px 12px' }}>Execute</button>
                </div>
                <div className="alert-item-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={18} style={{ color: '#4a5568' }} />
                    <span style={{ fontWeight: '500', color: '#2d3748' }}>Sync Machine Learning Models</span>
                  </div>
                  <button className="action-btn-green" style={{ padding: '6px 12px' }}>Sync Data</button>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}