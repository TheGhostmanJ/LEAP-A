import React, { useState, useEffect } from 'react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Banknote, Search, FileDown, TrendingUp, DollarSign, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import './payroll.css';

export default function Payroll({ onLogout, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [monetizations, setMonetizations] = useState([]);
  const [stats, setStats] = useState({ disbursed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // Fetch both routes simultaneously
        const [statsRes, listRes] = await Promise.all([
          fetch(`${apiUrl}/api/payroll/stats`),
          fetch(`${apiUrl}/api/payroll/monetizations`)
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (listRes.ok) {
          const listData = await listRes.json();
          setMonetizations(listData);
        }
      } catch (error) {
        console.error("Failed to load payroll data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format shorthand numbers (e.g., 142500 -> 142.5K)
  const formatCompactNumber = (num) => {
    if (num >= 1000000) return `₱ ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₱ ${(num / 1000).toFixed(1)}K`;
    return formatCurrency(num);
  };

  // Client-side Search Filter
  const filteredMonetizations = monetizations.filter((req) => {
    const fullName = `${req.first_name} ${req.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      (req.monetization_id && req.monetization_id.toLowerCase().includes(query)) ||
      (req.department && req.department.toLowerCase().includes(query))
    );
  });

  return (
    <div className="payroll-layout-wrapper">
      <HrSidebar />

      <div className="payroll-main-container">
        {/* Top Header */}
        <header className="payroll-global-header">
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* Content Body */}
        <main className="payroll-main-content fade-in-up">
          <div className="payroll-page">
            
            {/* Title Section */}
            <div className="payroll-header-row">
              <div className="payroll-title-layout">
                <div className="payroll-title-icon-badge">
                  <Banknote size={26} />
                </div>
                <div>
                  <h1 className="payroll-title">Payroll & Ledger</h1>
                  <p className="payroll-subtitle">
                    Portal: <span className="payroll-subtitle-accent">HR Operations</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Dashboard Row */}
            <section className="payroll-metrics-grid">
              <div className="payroll-stat-card hover-lift">
                <div className="stat-icon-wrapper stat-green-bg">
                  <DollarSign size={22} className="stat-icon-green" />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Monetization Disbursed</span>
                  <div className="stat-value-group">
                    <span className="stat-number text-green">{formatCompactNumber(stats.disbursed)}</span>
                    {stats.disbursed > 0 && (
                      <span className="stat-trend positive">
                        <ArrowUpRight size={14} /> Active
                      </span>
                    )}
                  </div>
                  <span className="stat-subtext">Current Year Total</span>
                </div>
              </div>

              <div className="payroll-stat-card hover-lift">
                <div className="stat-icon-wrapper stat-maroon-bg">
                  <TrendingUp size={22} className="stat-icon-maroon" />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Pending Requests</span>
                  <div className="stat-value-group">
                    <span className="stat-number">{stats.pending}</span>
                    {stats.pending > 0 && <span className="stat-badge-inline">Requires Action</span>}
                  </div>
                  <span className="stat-subtext">Awaiting HR Review</span>
                </div>
              </div>
            </section>

            {/* Utilities Toolbar */}
            <div className="payroll-utility-bar">
              <div className="payroll-search-wrapper">
                <Search size={18} className="payroll-search-icon" />
                <input
                  type="text"
                  className="payroll-search-input"
                  placeholder="Search employee, department, or ref ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="btn-export-green">
                <FileDown size={18} /> Export Master Ledger
              </button>
            </div>

            {/* Data Table Container */}
            <section className="payroll-card-container">
              <div className="payroll-card-header">
                Leave Monetization Requests
              </div>

              <div className="payroll-table-scroll">
                <table className="payroll-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Ref ID</th>
                      <th style={{ width: '22%' }}>Employee Name</th>
                      <th style={{ width: '20%' }}>Department</th>
                      <th style={{ width: '16%' }}>Leave Type</th>
                      <th style={{ width: '14%' }}>Credits Converted</th>
                      <th style={{ width: '16%' }}>Calculated Amount</th>
                      <th style={{ width: '15%' }} className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="payroll-empty-cell">Loading ledger records...</td>
                      </tr>
                    ) : filteredMonetizations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="payroll-empty-cell">
                          No matching monetization records found.
                        </td>
                      </tr>
                    ) : (
                      filteredMonetizations.map((req) => (
                        <tr key={req.monetization_id}>
                          <td className="ref-id-cell">{req.monetization_id}</td>
                          <td className="employee-name-cell">{req.first_name} {req.last_name}</td>
                          <td className="dept-cell">{req.department}</td>
                          <td>{req.leave_type}</td>
                          <td className="days-cell">
                            <strong>{Number(req.credits_converted)}</strong> Days
                          </td>
                          <td className="amount-cell">{formatCurrency(req.calculated_amount)}</td>
                          <td className="text-center">
                            <span className={`status-badge status-${req.status.replace(/\s+/g, '-').toLowerCase()}`}>
                              {req.status === 'Pending Review' && <Clock size={13} />}
                              {req.status === 'Approved' && <CheckCircle2 size={13} />}
                              {req.status === 'Credited' && <DollarSign size={13} />}
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}