import React from 'react';
import HrSidebar from '../../components/hr-sidebar';
import { Bell, Banknote, Search, FileDown, TrendingUp, DollarSign } from 'lucide-react';

export default function Payroll({ onLogout, user }) {
  const monetizations = [
    { id: 'M-1021', employee: 'Juan Dela Cruz', department: 'IT Operations', type: 'Vacation Leave', days: 5, amount: '₱ 7,500.00', status: 'Pending Review' },
    { id: 'M-1022', employee: 'Anita Gatchalian', department: 'City Planning', type: 'Sick Leave', days: 10, amount: '₱ 14,200.00', status: 'Approved' },
    { id: 'M-1023', employee: 'Roberto Lim', department: 'City Budget Office', type: 'Vacation Leave', days: 3, amount: '₱ 6,150.00', status: 'Credited' },
  ];

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <Banknote size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Payroll & Ledger</h2>
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

        {/* METRICS ROW (Reusing the forecast-summary styling) */}
        <section className="forecast-summary-metrics-row" style={{ marginTop: '24px' }}>
          <div className="forecast-stat-card" style={{ flex: 1 }}>
            <div className="stat-left-labels">
              <span className="stat-main-label"><DollarSign size={16} className="inline-icon" /> Monetization Disbursed</span>
              <span className="stat-subtext-label">Current Month (July)</span>
            </div>
            <div className="stat-right-numbers text-green-value">₱ 142.5K</div>
          </div>
          <div className="forecast-stat-card" style={{ flex: 1 }}>
            <div className="stat-left-labels">
              <span className="stat-main-label"><TrendingUp size={16} className="inline-icon" /> Pending Requests</span>
              <span className="stat-subtext-label">Awaiting HR Review</span>
            </div>
            <div className="stat-right-numbers text-dark-value">14</div>
          </div>
        </section>

        <div className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search employee or ref ID..." />
          </div>
          <button className="primary-action-trigger-btn" style={{ backgroundColor: '#059669' }}>
            <FileDown size={16} /> Export Master Ledger
          </button>
        </div>

        <section className="content-data-box table-box-margin card-shadow-wrap" style={{ marginTop: '24px' }}>
          <div className="box-header-title-maroon-bar">
            Leave Monetization Requests
          </div>

          <div className="table-responsive-scroll">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Credits Converted</th>
                  <th>Calculated Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monetizations.map((req) => (
                  <tr key={req.id}>
                    <td style={{ color: '#6b7280', fontFamily: 'monospace', fontWeight: '600' }}>{req.id}</td>
                    <td style={{ fontWeight: '600' }}>{req.employee}</td>
                    <td>{req.department}</td>
                    <td>{req.type}</td>
                    <td><strong>{req.days}</strong> Days</td>
                    <td style={{ color: '#059669', fontWeight: '700' }}>{req.amount}</td>
                    <td>
                      <span className={`status-badge status-${req.status.replace(' ', '-').toLowerCase()}`}>
                        {req.status}
                      </span>
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