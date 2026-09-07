import React from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Banknote, Search, FileDown, TrendingUp, DollarSign } from 'lucide-react';
import './payroll.css';

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
        {/* GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <div className="title-icon-badge">
              <Banknote size={36} className="title-icon-svg" /> 
            </div>
            <div className="title-text-group">
              <h2>Payroll & Ledger</h2>
              <p className="subtitle-department">Portal: <span className="highlight-maroon">HR Operations</span></p>
            </div>
          </div>
          
          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS ROW */}
        <section className="forecast-summary-metrics-row payroll-metrics-row">
          <div className="forecast-stat-card payroll-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><DollarSign size={16} className="inline-icon" /> Monetization Disbursed</span>
              <span className="stat-subtext-label">Current Month (July)</span>
            </div>
            <div className="stat-right-numbers text-green-value">₱ 142.5K</div>
          </div>
          <div className="forecast-stat-card payroll-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label"><TrendingUp size={16} className="inline-icon" /> Pending Requests</span>
              <span className="stat-subtext-label">Awaiting HR Review</span>
            </div>
            <div className="stat-right-numbers text-dark-value">14</div>
          </div>
        </section>

        {/* UTILITY BAR */}
        <div className="table-filter-utilities-row payroll-utility-row">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" className="utility-search-field" placeholder="Search employee or ref ID..." />
          </div>
          <button className="primary-action-trigger-btn export-btn">
            <FileDown size={16} /> Export Master Ledger
          </button>
        </div>

        {/* DATA TABLE */}
        <section className="content-data-box table-box-margin card-shadow-wrap payroll-table-card">
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
                    <td className="ref-id-cell">{req.id}</td>
                    <td className="employee-name-cell">{req.employee}</td>
                    <td>{req.department}</td>
                    <td>{req.type}</td>
                    <td><strong>{req.days}</strong> Days</td>
                    <td className="amount-cell">{req.amount}</td>
                    <td>
                      <span className={`status-badge status-${req.status.replace(/\s+/g, '-').toLowerCase()}`}>
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