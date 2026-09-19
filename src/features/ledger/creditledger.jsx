import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Search,
    ChevronRight,
    BookOpen,
    Loader2,
    Wallet,
    ArrowDownRight,
    ArrowUpRight
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './creditledger.css';

export default function CreditLedger({ onLogout, user }) {
    const navigate = useNavigate();
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
                    
                    const balObj = {};
                    data.balances.forEach(b => {
                        balObj[b.leave_type] = parseFloat(b.remaining_credits);
                    });
                    setBalances(balObj);

                    const useObj = {};
                    data.used.forEach(u => {
                        useObj[u.leave_type] = parseFloat(u.used_days);
                    });
                    setUsage(useObj);

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
        <div className="app-layout-wrapper">
            <RoleSidebar user={user}/>

            <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
                <header className="app-global-header">
                    <div className="app-title-layout">
                        <div className="app-title-icon-badge" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h1 className="app-title">Credit Ledger</h1>
                            <p className="app-subtitle">
                                Manage your <span className="app-subtitle-accent" style={{ color: 'var(--color-success)' }}>Leave Balances</span>
                            </p>
                        </div>
                    </div>
                    <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
                </header>

                <section className="cl-metrics-two-col">
                    <div className="app-card cl-summary-card">
                        <div className="cl-card-label-row">
                            <Calendar size={16} style={{ color: 'var(--color-maroon)' }} />
                            <span>REMAINING CREDIT BALANCE</span>
                        </div>

                        <div className="cl-donut-content">
                            <div className="cl-donut-ring">
                                <svg viewBox="0 0 36 36" className="cl-donut-svg">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-border-light)" strokeWidth="4" />
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
                                <div className="cl-donut-center">
                                    <BookOpen size={20} color="var(--color-text-secondary)" />
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

                    <div className="app-card cl-summary-card">
                        <div className="cl-card-label-row">
                            <BookOpen size={16} style={{ color: 'var(--color-maroon)' }} />
                            <span>CREDITS USED & MONETIZED</span>
                        </div>

                        <div className="cl-progress-card-content">
                            <div className="cl-large-num">
                                {totalUsed.toFixed(1)} <span className="cl-unit">Days Used This Year</span>
                            </div>

                            <div className="cl-multi-bar">
                                {usedBarSegments.map(seg => (
                                    seg.widthPct > 0 && (
                                        <div 
                                            key={seg.type} 
                                            style={{ 
                                                width: `${seg.widthPct}%`, 
                                                backgroundColor: seg.type === 'Sick Leave' ? 'var(--color-warning)' : seg.type === 'Vacation Leave' ? 'var(--color-maroon)' : 'var(--color-text-secondary)'
                                            }}
                                            className="cl-bar-segment"
                                        ></div>
                                    )
                                ))}
                                <div style={{ width: `${emptyBarWidthPct}%` }} className="cl-bar-empty-segment"></div>
                            </div>

                            <div className="cl-used-breakdown">
                                {usedBarSegments.map(seg => (
                                    seg.used > 0 && (
                                        <div key={seg.type} className="cl-breakdown-item">
                                            <span className="cl-breakdown-val">{seg.used.toFixed(1)} days</span>
                                            <span>{seg.type.split(' ')[0]}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="cl-sub-bar-text">
                                <span>Used: {totalUsed.toFixed(1)} days</span>
                                <span>Available: {totalRemaining.toFixed(1)} days</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cl-controls-row" id="ledger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="app-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input 
                            type="month" 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="app-search-input"
                            style={{ paddingLeft: '38px', width: '200px', cursor: 'pointer' }}
                        />
                    </div>
                </section>

                <section className="app-card">
                    <div className="app-card-header">Transaction History Ledger</div>
                    <div className="responsive-table-overflow-scroller">
                        <table className="record-grid-system">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction Details</th>
                                    <th>Status</th>
                                    <th>Authorized By</th>
                                    <th style={{ textAlign: 'right' }}>Credit Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                                            <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                                            No ledger transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.formattedDate}</td>
                                            <td>
                                                <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.transaction}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{item.type}</div>
                                            </td>
                                            <td>
                                                <span className={`app-status-badge ${item.status === 'Approved' || item.status === 'Credited' ? 'status-success' : 'status-warning'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{item.approver}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-danger)' }}>
                                                - {item.days} Days
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