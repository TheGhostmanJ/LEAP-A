import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    ChevronRight,
    BookOpen,
    Loader2
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './creditledger.css';

export default function CreditLedger({ onLogout, user }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    
    // Dynamic Data States
    const [isLoading, setIsLoading] = useState(true);
    const [balances, setBalances] = useState({});
    const [usage, setUsage] = useState({});
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchLedgerData = async () => {
            const empKey = user?.employee_key || user?.id;
            if (!empKey) return;

            setIsLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/api/credit-ledger/${empKey}`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Format Balances array into an easily readable object
                    const balObj = {};
                    data.balances.forEach(b => {
                        balObj[b.leave_type] = parseFloat(b.remaining_credits);
                    });
                    setBalances(balObj);

                    // Format Usage array
                    const useObj = {};
                    data.used.forEach(u => {
                        useObj[u.leave_type] = parseFloat(u.used_days);
                    });
                    setUsage(useObj);

                    // Format History
                    const formattedHistory = data.history.map(item => ({
                        ...item,
                        formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                        })
                    }));
                    setHistory(formattedHistory);
                }
            } catch (err) {
                console.error("Failed to load credit ledger data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLedgerData();
    }, [user]);

    // --- Chart Calculations ---
    const getRemaining = (type) => balances[type] || 0;
    const getUsed = (type) => usage[type] || 0;

    const totalRemaining = Object.values(balances).reduce((a, b) => a + b, 0);
    const totalUsed = Object.values(usage).reduce((a, b) => a + b, 0);
    const totalAvailableAndUsed = totalRemaining + totalUsed;

    const leaveTypes = ['Sick Leave', 'Vacation Leave', 'Emergency Leave'];
    
    // SVG Donut Chart Logic
    const donutSegments = (() => {
        if (totalRemaining <= 0) return [];
        let cumulative = 0;
        const colors = { 'Sick Leave': '#d97706', 'Vacation Leave': '#7a0000', 'Emergency Leave': '#64748b' };
        
        return leaveTypes.map((type) => {
            const value = getRemaining(type);
            const pct = totalRemaining > 0 ? (value / totalRemaining) * 100 : 0;
            const segment = {
                type,
                color: colors[type] || '#475569',
                dasharray: `${pct.toFixed(2)} ${(100 - pct).toFixed(2)}`,
                dashoffset: -cumulative,
            };
            cumulative += pct;
            return segment;
        });
    })();

    // Stacked Bar Logic
    const usedBarSegments = leaveTypes.map((type) => {
        const usedVal = getUsed(type);
        const widthPct = totalAvailableAndUsed > 0 ? (usedVal / totalAvailableAndUsed) * 100 : 0;
        return { type, used: usedVal, widthPct };
    });

    const emptyBarWidthPct = totalAvailableAndUsed > 0
        ? Math.max(0, 100 - usedBarSegments.reduce((s, seg) => s + seg.widthPct, 0))
        : 100;

    // --- Filters ---
    const filteredHistory = history.filter((item) => {
        const matchesSearch = 
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transaction.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesMonth = true;
        if (selectedMonth) {
            const itemDate = new Date(item.date);
            const [year, month] = selectedMonth.split('-');
            matchesMonth = itemDate.getFullYear() === parseInt(year) && (itemDate.getMonth() + 1) === parseInt(month);
        }

        return matchesSearch && matchesMonth;
    });

    return (
        <div className="cl-dashboard-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <RoleSidebar user={user}/>

            <main 
                className="cl-main-content app-main-content fade-in-up" 
                style={{ 
                    flex: 1, 
                    height: '100vh', 
                    overflowY: 'auto', 
                    paddingBottom: '40px' 
                }}
            >
                {/* HEADER SECTION */}
                <header className="cl-header">
                    <Header user={user} onLogout={onLogout} />
                </header>

                {/* 2-COLUMN METRIC SECTION */}
                <section className="cl-metrics-two-col">
                    {/* LEFT CARD: Remaining Balance */}
                    <div className="cl-summary-card card-amber-accent hover-lift">
                        <div className="cl-card-label-row">
                            <Calendar size={16} className="cl-icon-amber" />
                            <span>REMAINING CREDIT BALANCE</span>
                        </div>

                        <div className="cl-donut-content">
                            <div className="cl-donut-ring">
                                <svg viewBox="0 0 36 36" style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                    {donutSegments.map((seg) => (
                                        <circle
                                            key={seg.type}
                                            cx="18"
                                            cy="18"
                                            r="15.915"
                                            fill="none"
                                            stroke={seg.color}
                                            strokeWidth="4"
                                            strokeDasharray={seg.dasharray}
                                            strokeDashoffset={seg.dashoffset}
                                        />
                                    ))}
                                </svg>
                                <div className="cl-donut-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <BookOpen size={20} color="#475569" />
                                </div>
                            </div>

                            <div className="cl-donut-info">
                                <div className="cl-donut-value">
                                    {totalRemaining.toFixed(1)} <span className="cl-unit">Days</span>
                                </div>
                                <div className="cl-legend-list">
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-amber"></span>
                                        Sick Leave ({getRemaining('Sick Leave').toFixed(2)} days)
                                    </div>
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-maroon"></span>
                                        Vacation Leave ({getRemaining('Vacation Leave').toFixed(2)} days)
                                    </div>
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-slate"></span>
                                        Emergency Leave ({getRemaining('Emergency Leave').toFixed(2)} days)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="cl-card-footer-subtext">
                            <a href="#ledger">See Detail Log ↓</a>
                        </div>
                    </div>

                    {/* RIGHT CARD: Credits Used / Monetized */}
                    <div className="cl-summary-card card-maroon-accent hover-lift">
                        <div className="cl-card-label-row">
                            <BookOpen size={16} className="cl-icon-maroon" />
                            <span>CREDITS USED & MONETIZED</span>
                        </div>

                        <div className="cl-progress-card-content">
                            <div className="cl-large-num">
                                {totalUsed.toFixed(1)} <span className="cl-unit">Days Used This Year</span>
                            </div>

                            <div className="cl-multi-bar" style={{ display: 'flex', height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden', marginTop: '12px' }}>
                                {usedBarSegments.map(seg => (
                                    seg.widthPct > 0 && (
                                        <div key={seg.type} style={{ 
                                            width: `${seg.widthPct}%`, 
                                            backgroundColor: seg.type === 'Sick Leave' ? '#d97706' : seg.type === 'Vacation Leave' ? '#7a0000' : '#475569',
                                            height: '100%'
                                        }}></div>
                                    )
                                ))}
                                <div style={{ width: `${emptyBarWidthPct}%`, backgroundColor: '#e2e8f0', height: '100%' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: '#475569' }}>
                                {usedBarSegments.map(seg => (
                                    seg.used > 0 && (
                                        <div key={seg.type} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600 }}>{seg.used.toFixed(1)} days</span>
                                            <span>{seg.type.split(' ')[0]}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="cl-sub-bar-text" style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                <span>Used: {totalUsed.toFixed(1)} days</span>
                                <span>Available: {totalRemaining.toFixed(1)} days</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTROLS & FILTER ROW */}
                <section className="cl-controls-row" id="ledger">
                    <div className="cl-search-wrapper">
                        <Search size={14} className="cl-search-icon" />
                        <input
                            type="text"
                            placeholder="Search leave type, status, transaction type..."
                            className="cl-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="cl-filter-actions">
                        <div className="cl-date-picker-btn" style={{ padding: 0, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                            <input 
                                type="month" 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ border: 'none', padding: '8px 12px', fontSize: '13px', outline: 'none', background: 'transparent' }}
                            />
                        </div>
                    </div>
                </section>

                {/* LEDGER TABLE CARD */}
                <section className="cl-table-card">
                    <div className="cl-table-header">
                        <h3>Credit Ledger Table</h3>
                        <span className="cl-table-counter">Logs updated in real-time</span>
                    </div>

                    <div className="cl-table-wrapper">
                        <table className="cl-data-table">
                            <thead>
                                <tr>
                                    <th>Date Filed</th>
                                    <th>Transaction Type</th>
                                    <th>Status</th>
                                    <th>Days</th>
                                    <th>Approver</th>
                                    <th className="cl-th-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                            <Loader2 size={24} className="spin" style={{ margin: '0 auto', display: 'block' }}/>
                                            <p style={{ marginTop: '8px' }}>Fetching ledger data...</p>
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                            No ledger transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="cl-td-bold">{item.formattedDate}</td>
                                            <td>{item.transaction} ({item.type})</td>
                                            <td>
                                                <span className={`cl-pill-status ${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="cl-td-bold">{item.days} Days</td>
                                            <td>{item.approver}</td>
                                            <td className="cl-td-right">
                                                <button className="cl-action-btn">
                                                    View Details <ChevronRight size={12} />
                                                </button>
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
    );
}
