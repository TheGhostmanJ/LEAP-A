import React from 'react';
import ItSidebar from '../../components/it-sidebar';
import { Bell, Settings, Save, ServerCrash, Key } from 'lucide-react';

export default function SystemSettings({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      <ItSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Settings size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>System Settings</h2>
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

        <div className="forecast-grid-split" style={{ marginTop: '24px' }}>
          
          {/* Left Column: General Configuration */}
          <div className="forecast-left-column">
            <div className="content-data-box table-box-margin card-shadow-wrap">
              <div className="box-header-title-maroon-bar">
                Core Application Settings
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>System Maintenance Mode</label>
                  <select style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', maxWidth: '300px' }}>
                    <option value="false">Disabled (Live to Users)</option>
                    <option value="true">Enabled (Lockout non-IT accounts)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>ML Analytics Sync Interval</label>
                  <select style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', maxWidth: '300px' }}>
                    <option value="12">Every 12 Hours</option>
                    <option value="24" selected>Every 24 Hours</option>
                    <option value="48">Every 48 Hours</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Determines how often the predictive models fetch new database entries.</span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button className="primary-action-trigger-btn">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Danger Zone */}
          <div className="forecast-right-column">
            <div className="content-data-box paddingless-box shadow-card" style={{ borderTop: '4px solid #dc2626' }}>
              <div className="box-header-title" style={{ color: '#dc2626' }}>Security & Critical Operations</div>
              <div className="alert-list-wrapper">
                
                <div className="alert-item-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Key size={18} style={{ color: '#4a5568' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>Rotate API Keys</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Invalidate current external tokens</div>
                    </div>
                  </div>
                  <button className="action-btn-investigate" style={{ padding: '6px 12px', color: '#dc2626' }}>Execute</button>
                </div>

                <div className="alert-item-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ServerCrash size={18} style={{ color: '#4a5568' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>Force Restart Services</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Reboots Node backend immediately</div>
                    </div>
                  </div>
                  <button className="action-btn-investigate" style={{ padding: '6px 12px', color: '#dc2626' }}>Restart</button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}