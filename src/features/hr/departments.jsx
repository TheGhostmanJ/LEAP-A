import React from 'react';
import HrSidebar from '../../components/hr-sidebar';
import { Bell, Search, Building2, Plus, Users, Settings } from 'lucide-react';

export default function Departments({ onLogout, user }) {
  const departments = [
    { id: 'D01', name: 'City Planning & Development', head: 'Ar. Roberto Lim', headcount: 45, max: 50 },
    { id: 'D02', name: 'City Budget Office', head: 'Maria Santos', headcount: 28, max: 30 },
    { id: 'D03', name: 'Human Resources', head: 'Diana Cruz', headcount: 15, max: 20 },
    { id: 'D04', name: 'IT Operations', head: 'Mark Villanueva', headcount: 12, max: 15 },
  ];

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Building2 size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Department Setup</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
            </button>
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HR Admin'}</span>
            </div>
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        <div className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search departments..." />
          </div>
          <button className="primary-action-trigger-btn">
            <Plus size={16} /> Create Department
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar">
            Organizational Structure
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Dept Code</th>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Active Headcount</th>
                  <th>Capacity</th>
                  <th style={{ textAlign: 'center' }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td style={{ color: '#6b7280', fontWeight: '500' }}>{dept.id}</td>
                    <td style={{ fontWeight: '700', color: '#1a202c' }}>{dept.name}</td>
                    <td>{dept.head}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Users size={14} color="#7a0000" /> {dept.headcount} / {dept.max}
                      </div>
                    </td>
                    <td>
                      {/* Simple progress bar to show capacity visually */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(dept.headcount / dept.max) * 100}%`, height: '100%', backgroundColor: '#7a0000' }}></div>
                      </div>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="action-btn-investigate" style={{ padding: '6px 12px' }}>
                        <Settings size={14} /> Configure
                      </button>
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