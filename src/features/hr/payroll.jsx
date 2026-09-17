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

  // Safe filter logic to prevent crashes
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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <HrSidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Header user={user} onLogout={onLogout} />
        </header>

        <main style={{ padding: '32px' }} className="fade-in-up">
          <div className="page-title-layout">
            <div className="title-icon-badge">
              <Banknote size={26} className="title-icon-svg" />
            </div>
            <div className="title-text-group">
              <h2>Payroll & Ledger</h2>
              <p className="subtitle-department">
                Portal: <span className="highlight-maroon">HR Operations</span>
              </p>
            </div>
          </div>

          <section className="payroll-metrics-row" style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
            <div className="payroll-stat-card hover-lift" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#d1fae5', padding: '12px', borderRadius: '50%' }}>
                <DollarSign size={24} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Monetization Disbursed</div>
                <div className="text-green-value" style={{ fontSize: '24px', fontWeight: 800 }}>{formatCompactNumber(stats.disbursed)}</div>
              </div>
            </div>

            <div className="payroll-stat-card hover-lift" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '50%' }}>
                <TrendingUp size={24} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Pending Requests</div>
                <div className="text-dark-value" style={{ fontSize: '24px', fontWeight: 800 }}>{stats.pending}</div>
              </div>
            </div>
          </section>

          <div className="payroll-utility-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '350px' }}>
              <Search size={18} color="#64748b" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search employee, department, or ref ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>

            <button className="export-btn" style={{ color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
              <FileDown size={18} /> Export Master Ledger
            </button>
          </div>

          <section className="payroll-table-card" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '16px' }}>
              Leave Monetization Requests
            </div>

            <div className="table-responsive-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px', width: '12%' }}>Ref ID</th>
                    <th style={{ padding: '16px 24px', width: '22%' }}>Employee Name</th>
                    <th style={{ padding: '16px 24px', width: '20%' }}>Department</th>
                    <th style={{ padding: '16px 24px', width: '16%' }}>Leave Type</th>
                    <th style={{ padding: '16px 24px', width: '14%' }}>Credits Converted</th>
                    <th style={{ padding: '16px 24px', width: '16%' }}>Calculated Amount</th>
                    <th style={{ padding: '16px 24px', width: '15%' }} className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading ledger records...</td></tr>
                  ) : filteredMonetizations.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No matching monetization records found.</td></tr>
                  ) : (
                    filteredMonetizations.map((req) => (
                      <tr key={req.monetization_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 24px' }} className="ref-id-cell">{req.monetization_id}</td>
                        <td style={{ padding: '16px 24px' }} className="employee-name-cell">{req.first_name} {req.last_name}</td>
                        <td style={{ padding: '16px 24px' }}>{req.department}</td>
                        <td style={{ padding: '16px 24px' }}>{req.leave_type}</td>
                        <td style={{ padding: '16px 24px' }}><strong>{Number(req.credits_converted)}</strong> Days</td>
                        <td style={{ padding: '16px 24px' }} className="amount-cell">{formatCurrency(req.calculated_amount)}</td>
                        <td style={{ padding: '16px 24px' }} className="text-center">
                          <span className={`status-badge status-${(req.status || 'pending').replace(/\s+/g, '-').toLowerCase()}`}>
                            {req.status === 'Pending Review' && <Clock size={13} style={{marginRight: '4px'}}/>}
                            {req.status === 'Approved' && <CheckCircle2 size={13} style={{marginRight: '4px'}}/>}
                            {req.status === 'Credited' && <DollarSign size={13} style={{marginRight: '4px'}}/>}
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
        </main>
      </div>
    </div>
  );
}