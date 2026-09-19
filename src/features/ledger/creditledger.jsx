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
        <div className="cl-dashboard-container">
            <RoleSidebar user={user}/>

            <main className="cl-main-content fade-in-up">
                {/* HEADER SECTION */}
                <header className="cl-header">
                    <Header user={user} onLogout={onLogout} />
                </header>

                {/* THE WALLET CARDS - Focuses only on the current numeric state */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div className="app-card" style={{ padding: '24px', borderTop: '4px solid var(--color-success)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>
                            <span>Vacation Leave</span>
                            <BookOpen size={16} />
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '12px 0' }}>
                            {getRemaining('Vacation Leave').toFixed(2)}
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--color-danger)', fontWeight: '600' }}>
                            - {getUsed('Vacation Leave').toFixed(2)} Days Used YTD
                        </div>
                    </div>

                    <div className="app-card" style={{ padding: '24px', borderTop: '4px solid var(--color-warning)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>
                            <span>Sick Leave</span>
                            <BookOpen size={16} />
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '12px 0' }}>
                            {getRemaining('Sick Leave').toFixed(2)}
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--color-danger)', fontWeight: '600' }}>
                            - {getUsed('Sick Leave').toFixed(2)} Days Used YTD
                        </div>
                    </div>

                    <div className="app-card" style={{ padding: '24px', borderTop: '4px solid var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>
                            <span>Emergency Leave</span>
                            <BookOpen size={16} />
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '12px 0' }}>
                            {getRemaining('Emergency Leave').toFixed(2)}
                        </div>
                        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--color-danger)', fontWeight: '600' }}>
                            - {getUsed('Emergency Leave').toFixed(2)} Days Used YTD
                        </div>
                    </div>
                </section>

                <section style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search ledger transactions..."
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

                {/* THE LEDGER TABLE - Focuses purely on the Math (+ / -) */}
                <section className="app-card">
                    <div className="app-card-header">Transaction History Ledger</div>
                    <div className="responsive-table-overflow-scroller">
                        <table className="record-grid-system">
                            <thead>
                                <tr>
                                    <th>Transaction Date</th>
                                    <th>Description</th>
                                    <th>Leave Type</th>
                                    <th style={{ textAlign: 'center' }}>Credits Earned (+)</th>
                                    <th style={{ textAlign: 'center' }}>Credits Used (-)</th>
                                    <th style={{ textAlign: 'center' }}>Ledger Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                                            <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                                            No ledger transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.formattedDate}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.transaction}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{item.type}</td>
                                            
                                            {/* Earned Column */}
                                            <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--color-success)' }}>
                                                {item.isAccrual ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><PlusCircle size={14}/> {item.days}</span>
                                                ) : '—'}
                                            </td>
                                            
                                            {/* Used Column */}
                                            <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--color-danger)' }}>
                                                {item.isDeduction ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MinusCircle size={14}/> {item.days}</span>
                                                ) : '—'}
                                            </td>

                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`app-status-badge ${item.status === 'Approved' || item.status === 'Credited' || item.status === 'Applied' ? 'status-success' : 'status-warning'}`}>
                                                    {item.status}
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
    );
}