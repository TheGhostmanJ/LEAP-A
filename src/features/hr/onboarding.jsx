import React, { useState } from 'react';
import HrSidebar from '../../components/hr-sidebar';
import { Bell, Search, Users, UserPlus, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Onboarding({ onLogout, user }) {
  // Mock data for new hires
  const [newHires, setNewHires] = useState([
    { id: 1, name: 'Miguel Santos', department: 'City Planning', role: 'Urban Planner I', date: 'Jul 25, 2026', status: 'Pending Setup' },
    { id: 2, name: 'Elena Reyes', department: 'City Budget Office', role: 'Financial Analyst', date: 'Jul 21, 2026', status: 'Active' },
    { id: 3, name: 'Carlos Mendoza', department: 'IT Operations', role: 'Systems Admin', date: 'Jul 28, 2026', status: 'Pending Setup' },
  ]);

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Users size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Employee Onboarding</h2>
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

        {/* UTILITY BAR */}
        <div className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search new hires..." />
          </div>
          <button className="primary-action-trigger-btn">
            <UserPlus size={16} /> Register New Employee
          </button>
        </div>

        {/* DATA TABLE */}
        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar">
            Recent Onboarding Records
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Target Start Date</th>
                  <th>Setup Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {newHires.map((hire) => (
                  <tr key={hire.id}>
                    <td style={{ fontWeight: '600', color: '#1f2937' }}>{hire.name}</td>
                    <td>{hire.department}</td>
                    <td>{hire.role}</td>
                    <td>{hire.date}</td>
                    <td>
                      <span className={`status-badge ${hire.status === 'Active' ? 'status-approved' : 'status-pending'}`} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {hire.status === 'Active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {hire.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="action-btn-investigate" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <FileText size={14} /> Profile
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