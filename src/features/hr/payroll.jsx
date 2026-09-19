import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import { Banknote, Search, FileDown, TrendingUp, DollarSign, Clock, CheckCircle2, ArrowUpRight, Wallet } from 'lucide-react';
import './payroll.css';

export default function Payroll({ onLogout, user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('payroll');

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [monetizations, setMonetizations] = useState([]);
  const [stats, setStats] = useState({ disbursed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // Fetch all 3 endpoints concurrently
        const [statsRes, ledgerRes, payrollRes] = await Promise.all([
          fetch(`${apiUrl}/api/payroll/stats`),
          fetch(`${apiUrl}/api/payroll/monetizations`),
          fetch(`${apiUrl}/api/payroll/records`) // New dynamic endpoint
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (ledgerRes.ok) setMonetizations(await ledgerRes.json());
        if (payrollRes.ok) setPayrollRecords(await payrollRes.json());
        
      } catch (error) {
        console.error("Failed to load payroll data:", error);
      } finally {
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

  const filteredPayroll = payrollRecords.filter((rec) => {
    const query = searchQuery.toLowerCase();
    return (
      (rec.employee_name || '').toLowerCase().includes(query) ||
      (rec.payroll_ref_code || '').toLowerCase().includes(query) ||
      (rec.department || '').toLowerCase().includes(query)
    );
  });

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

      <main 
        className="app-main-container app-main-content fade-in-up" 
        style={{ padding: '32px', overflowY: 'auto', flex: 1 }}
      >
        
        <header className="app-global-header">
          <div className="app-title-layout">
            <div className="app-title-icon-badge">
              <Banknote size={20} />
            </div>
            <div>
              <h1 className="app-title">Payroll & Ledger</h1>
              <p className="app-subtitle">
                Portal: <span className="app-subtitle-accent">HR Operations</span>
              </p>
            </div>
          </div>
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

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

        {activeTab === 'payroll' && (
          <section className="app-card">
            <div className="app-card-header">
              Payroll Summary — Pay Period {payrollRecords.length > 0 ? payrollRecords[0].pay_period : 'July 1–15'}
            </div>
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
                  {isLoading ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading payroll records...</td></tr>
                  ) : filteredPayroll.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No matching payroll records found.</td></tr>
                  ) : (
                    filteredPayroll.map((rec) => (
                      <tr key={rec.payroll_ref_code}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{rec.payroll_ref_code}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{rec.employee_name}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{rec.department}</td>
                        <td>{rec.position_title}</td>
                        <td>{formatCurrency(rec.base_salary)}</td>
                        <td style={{ color: 'var(--color-danger)', fontWeight: '700' }}>- {formatCurrency(rec.deductions)}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: '700' }}>{formatCurrency(rec.net_pay)}</td>
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