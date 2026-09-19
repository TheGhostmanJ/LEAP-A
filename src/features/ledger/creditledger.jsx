import React, { useState, useEffect } from 'react';
import { Calendar, Search, BookOpen, Loader2, Wallet, PlusCircle, MinusCircle } from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './creditledger.css'; // You can keep your existing CSS file for this

export default function CreditLedger({ onLogout, user }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    
    // Dynamic Data States
    const [isLoading, setIsLoading] = useState(true);
    const [balances, setBalances] = useState({});
    const [usage, setUsage] = useState({});
    const [ledgerTransactions, setLedgerTransactions] = useState([]);

    useEffect(() => {
        const fetchLedgerData = async () => {
            const empKey = user?.employee_key || user?.id;
            if (!empKey) return;

            setIsLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                // This assumes your backend returns the UNION of Leave Applications, Monetizations, and (eventually) Monthly Accruals.
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

                    // Transform history into a strict +/- ledger format
                    const formattedHistory = data.history.map(item => {
                        // Logic to determine if it's an addition or deduction
                        const isAccrual = item.transaction.includes('Accrual') || item.transaction.includes('Earned');
                        const isDeduction = item.transaction.includes('Application') || item.transaction.includes('Monetization');
                        
                        return {
                            ...item,
                            isAccrual,
                            isDeduction,
                            formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                            })
                        };
                    });
                    setLedgerTransactions(formattedHistory);
                }
            } catch (err) {
                console.error("Failed to load credit ledger data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLedgerData();
    }, [user]);

    const getRemaining = (type) => balances[type] || 0;
    const getUsed = (type) => usage[type] || 0;

    const filteredHistory = ledgerTransactions.filter((item) => {
        const matchesSearch = 
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transaction.toLowerCase().includes(searchQuery.toLowerCase());
        
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
                                Track your <span className="app-subtitle-accent" style={{ color: 'var(--color-success)' }}>Leave Balances & Accruals</span>
                            </p>
                        </div>
                    </div>
                    {/* The Header component for controls */}
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