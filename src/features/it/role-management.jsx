import React, { useState } from 'react';
import ItSidebar from '../../components/it-sidebar';
import { Bell, Search, Shield, UserCog, Save, AlertTriangle } from 'lucide-react';

export default function RoleManagement({ onLogout, user }) {
  const [accounts, setAccounts] = useState([
    { id: 'E-001', name: 'Maria Santos', dept: 'City Budget Office', currentRole: 'Department Head', status: 'Active' },
    { id: 'E-042', name: 'Diana Cruz', dept: 'Human Resources', currentRole: 'HR Admin', status: 'Active' },
    { id: 'E-108', name: 'Juan Dela Cruz', dept: 'IT Operations', currentRole: 'Employee Self-Service', status: 'Active' },
    { id: 'E-212', name: 'Elena Reyes', dept: 'City Planning', currentRole: 'Disabled', status: 'Suspended' }
  ]);

  return (
    <div className="dashboard-container hod-view-wrapper">
      <ItSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Shield size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Role Management (RBAC)</h2>
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
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search employee ID or name..." />
          </div>
          <button className="action-btn-investigate" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertTriangle size={16} /> Audit Disabled Accounts
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar">
            System Access Level Assignments
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Account Name</th>
                  <th>Department</th>
                  <th>Account Status</th>
                  <th>System Access Level (Role)</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td style={{ color: '#6b7280', fontWeight: '500' }}>{acc.id}</td>
                    <td style={{ fontWeight: '600' }}>{acc.name}</td>
                    <td>{acc.dept}</td>
                    <td>
                      <span className={`status-badge ${acc.status === 'Active' ? 'status-approved' : 'status-rejected'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        defaultValue={acc.currentRole}
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', maxWidth: '200px' }}
                      >
                        <option value="Employee Self-Service">Employee Self-Service</option>
                        <option value="Department Head">Department Head</option>
                        <option value="HR Admin">HR Admin</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="action-btn-green" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Save size={14} /> Update
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