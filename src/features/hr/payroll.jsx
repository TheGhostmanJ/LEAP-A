import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Banknote, Search, FileDown, TrendingUp, DollarSign, Clock, CheckCircle2, ArrowUpRight, Wallet } from 'lucide-react';
import './payroll.css';

export default function Payroll({ onLogout, user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' | 'ledger'

  const [monetizations, setMonetizations] = useState([]);
  const [stats, setStats] = useState({ disbursed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Static fallback data for the Payroll tab (until a dedicated payroll API is built)
  const payrollRecords = [
    { id: 'P-3001', employee: 'Juan Dela Cruz', department: 'IT Operations', position: 'Systems Analyst', baseSalary: '₱ 32,000.00', deductions: '₱ 3,150.00', netPay: '₱ 28,850.00', payPeriod: 'July 1–15', status: 'Released' },
    { id: 'P-3002', employee: 'Anita Gatchalian', department: 'City Planning', position: 'Urban Planner II', baseSalary: '₱ 38,500.00', deductions: '₱ 4,020.00', netPay: '₱ 34,480.00', payPeriod: 'July 1–15', status: 'Processing' },
    { id: 'P-3003', employee: 'Roberto Lim', department: 'City Budget Office', position: 'Budget Officer I', baseSalary: '₱ 29,800.00', deductions: '₱ 2,890.00', netPay: '₱ 26,910.00', payPeriod: 'July 1–15', status: 'Released' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
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
      } fontally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatCompactNumber = (num) => {
    if (num >= 1000000) return `₱ ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₱ ${(num / 1000).toFixed(1)}K`;
    return formatCurrency(num);
  };

  const filteredPayroll = payrollRecords.filter(
    (rec) =>
      rec.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMonetizations = monetizations.filter((req) => {
    const fullName = `${req.first_name || ''} ${req.last_name || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      (req.monetization_id && req.monetization_id.toLowerCase().includes(query)) ||
      (req.department && req.department.toLowerCase().includes(query))
    );
  });

  return (
    <div className="app-layout-wrapper">
      <HrSidebar user={user} />

      {/* FIXED: Included app-main-content class and overflowY scrolling */}
      <main 
        className="app-main-container app-main-content fade-in-up" 
        style={{ padding: '32px', overflowY: 'auto', flex: 1 }}
      >
        
        {/* UNIFIED GLOBAL HEADER BLOCK */}
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* Metrics Dashboard Row */}
        <section className="payroll-metrics-grid">
          <div className="app-card payroll-stat-card">
            <div className="stat-icon-wrapper stat-green-bg">
              <DollarSign size={22} className="stat-icon-green" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Monetization Disbursed (YTD)</span>
              <div className="stat-value-group">
                <span className="stat-number text-green">{formatCompactNumber(stats.disbursed)}</span>
                <span className="stat-trend positive">
                  <ArrowUpRight size={14} /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="app-card payroll-stat-card">
            <div className="stat-icon-wrapper stat-maroon-bg">
              <TrendingUp size={22} className="stat-icon-maroon" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending Ledger Requests</span>
              <div className="stat-value-group">
                <span className="stat-number">{stats.pending}</span>
                {stats.pending > 0 && <span className="stat-badge-inline">Requires Action</span>}
              </div>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="payroll-tab-switcher" style={{ marginTop: '24px' }}>
          <button
            type="button"
            className={`payroll-tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
            onClick={() => setActiveTab('payroll')}
          >
            <Wallet size={16} /> Standard Payroll
          </button>
          <button
            type="button"
            className={`payroll-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <Banknote size={16} /> Leave Monetization Ledger
          </button>
        </div>

        {/* Utilities Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search employee, department, or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-search-input"
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <FileDown size={18} /> {activeTab === 'payroll' ? 'Export Payroll Report' : 'Export Master Ledger'}
          </button>
        </div>

        {/* Data Tables */}
        {activeTab === 'payroll' && (
          <section className="app-card">
            <div className="app-card-header">Payroll Summary — Pay Period July 1–15</div>
            <div className="responsive-table-overflow-scroller" style={{ maxHeight: '520px' }}>
              <table className="record-grid-system">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Base Salary</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No matching payroll records found.</td>
                    </tr>
                  ) : (
                    filteredPayroll.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{rec.id}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{rec.employee}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{rec.department}</td>
                        <td>{rec.position}</td>
                        <td>{rec.baseSalary}</td>
                        <td style={{ color: 'var(--color-danger)', fontWeight: '700' }}>- {rec.deductions}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: '700' }}>{rec.netPay}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`app-status-badge ${rec.status === 'Released' ? 'status-success' : 'status-warning'}`}>
                            {rec.status === 'Released' && <CheckCircle2 size={13} />}
                            {rec.status === 'Processing' && <Clock size={13} />}
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'ledger' && (
          <section className="app-card">
            <div className="app-card-header">Leave Monetization Requests</div>
            <div className="responsive-table-overflow-scroller" style={{ maxHeight: '520px' }}>
              <table className="record-grid-system">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Credits Converted</th>
                    <th>Calculated Amount</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading ledger records...</td></tr>
                  ) : filteredMonetizations.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No matching monetization records found.</td></tr>
                  ) : (
                    filteredMonetizations.map((req) => (
                      <tr key={req.monetization_id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{req.monetization_id}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{req.first_name} {req.last_name}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{req.department}</td>
                        <td>{req.leave_type}</td>
                        <td><strong style={{ color: 'var(--color-text-primary)' }}>{Number(req.credits_converted)}</strong> Days</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: '700' }}>{formatCurrency(req.calculated_amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`app-status-badge ${
                            req.status === 'Approved' ? 'status-success' : 
                            req.status === 'Credited' ? 'status-info' : 'status-warning'
                          }`}>
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
        )}
      </main>
    </div>
  );
}
