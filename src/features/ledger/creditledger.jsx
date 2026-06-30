import React, { useState, useEffect } from 'react';
import {
    Home,
    UserCheck,
    History,
    CreditCard,
    GraduationCap,
    User,
    HelpCircle,
    Clock,
    Bell,
    Search,
    SlidersHorizontal,
    Plus,
    Minus,
    Scale,
    Coins,
    AlertCircle
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';

export default function CreditLedger({ onNavigate, onLogout }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f9fa', fontFamily: 'system-ui, sans-serif' }}>
            <Sidebar />

            {/* MAIN CONTENT CONTAINER */}
            <main className="dashboard-main-content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' }}>

                {/* HEADER ARCHITECTURE */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={22} style={{ color: '#7a0000', display: 'flex', alignItems: 'center' }} />
                        <h2 style={{ margin: 0, padding: 0, fontSize: '24px', fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>
                            My Credit Ledger
                        </h2>
                    </div>

                    <div className="user-controls-cluster" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="icon-alert-btn">
                            <Bell size={18} />
                            <span className="badge-dot"></span>
                        </button>

                        <div className="profile-identity-card">
                            <div className="avatar-placeholder">
                                <User size={16} />
                            </div>
                            <span className="profile-name-label">Juan Dela Cruz</span>
                        </div>

                        <button className="logout-action-btn" onClick={onLogout}>
                            Log Out
                        </button>
                    </div>
                </header>

                {/* 3-COLUMN SUMMARY METRIC CARDS TRACK (EXACT PROTOTYPE VISUALS) */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    
                    {/* CARD 1: Total Earned Credits */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <Plus size={14} style={{ color: '#800000' }} />
                            <span>Total Earned Credits</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#850000', margin: '12px 0 6px 0', lineHeight: 1 }}>
                            16.5 <span style={{ fontSize: '24px', fontWeight: '700', color: '#850000' }}>Days</span>
                        </div>
                        {/* Segmented Color Bar */}
                        <div style={{ width: '100%', height: '10px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: '#e5e7eb', margin: '8px 0 4px 0' }}>
                            <div style={{ width: '73%', backgroundColor: '#bd1c1c' }}></div>
                            <div style={{ width: '27%', backgroundColor: '#f87171' }}></div>
                        </div>
                        {/* Segment Value Labels */}
                        <div style={{ position: 'relative', width: '100%', height: '14px', marginBottom: '12px' }}>
                            <div style={{ position: 'absolute', left: '55%', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>12 Days</div>
                            <div style={{ position: 'absolute', right: '0', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>4.5 Days</div>
                        </div>
                        {/* Legend Containers */}
                        <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: '#bd1c1c', borderRadius: '2px' }}></span>Current Year Earned
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: '#f87171', borderRadius: '2px' }}></span>Carryover
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Total Credits Used */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #a16207', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <Minus size={14} style={{ color: '#b45309' }} />
                            <span>Total Credits Used</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#374151', margin: '12px 0 6px 0', lineHeight: 1 }}>
                            2 <span style={{ fontSize: '24px', fontWeight: '700', color: '#ca8a04' }}>Days</span>
                        </div>
                        {/* Segmented Color Bar */}
                        <div style={{ width: '100%', height: '10px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: '#e5e7eb', margin: '8px 0 4px 0' }}>
                            <div style={{ width: '75%', backgroundColor: '#b45309' }}></div>
                            <div style={{ width: '25%', backgroundColor: '#9ca3af' }}></div>
                        </div>
                        {/* Segment Value Labels */}
                        <div style={{ position: 'relative', width: '100%', height: '14px', marginBottom: '12px' }}>
                            <div style={{ position: 'absolute', left: '55%', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>3 Days</div>
                            <div style={{ position: 'absolute', right: '0', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>1 Day</div>
                        </div>
                        {/* Legend Containers */}
                        <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: '#b45309', borderRadius: '2px' }}></span>Vacation
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>
                                <span style={{ width: '10px', height: '10px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></span>Sick
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Remaining Balance */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <Scale size={14} style={{ color: '#800000' }} />
                            <span>Remaining Balance</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#850000', margin: '26px 0 20px 0', lineHeight: 1 }}>
                            12.5 Days
                        </div>
                        <div style={{ width: '100%', height: '10px', borderRadius: '999px', backgroundColor: '#e5e7eb', marginTop: 'auto', marginBottom: '4px' }}></div>
                    </div>
                </section>

                {/* LEAVE MONETIZATION RIBBON BANNER */}
                <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Coins size={18} style={{ color: '#680000' }} />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#4a080e' }}>Leave Monetization Availability</span>
                        <span style={{ backgroundColor: '#38a169', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '3px 14px', borderRadius: '999px' }}>Eligible</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <span style={{ fontSize: '13px', color: '#4b5563' }}>
                            Credits Available: <strong style={{ fontSize: '14px', color: '#000' }}>12.5 <span style={{ color: '#7a0000' }}>Days</span></strong>
                        </span>
                        
                        <button style={{ background: 'linear-gradient(135deg, #a16207 0%, #78350f 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.2, boxShadow: '0 4px 6px rgba(0,0,0,0.06)' }}>
                            <span style={{ fontWeight: '700', fontSize: '12px' }}>Process 5 Days Monetization</span>
                            <span style={{ fontSize: '10px', opacity: 0.9 }}>(Estimated: ₱ 15, 250.00)</span>
                        </button>
                    </div>
                </section>

                {/* CONTROLS SEARCH ROW */}
                <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SlidersHorizontal size={18} style={{ color: '#4a5568', cursor: 'pointer' }} />
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#a0aec0' }} />
                            <input type="text" placeholder="Search..." style={{ width: '220px', padding: '6px 12px 6px 32px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        </div>
                    </div>
                </section>

                {/* ARCHITECTURE TRANSACTION TABLE */}
                <section className="data-table-container-card" style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ backgroundColor: '#4a080e', padding: '14px 20px', fontWeight: '700', fontSize: '14px', color: '#fff' }}>
                        Leave Monetization Table
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#cbd5e1' }}>
                                    <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Date</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Transaction Type</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Credit Charges</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Running Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>May 18, 2026</td>
                                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>Approved Leave Monetization</td>
                                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#e53e3e', fontWeight: '600' }}>-5.000</td>
                                    <td style={{ padding: '14px 12px', fontSize: '13px', color: '#38a169', fontWeight: '600' }}>14.500</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FOOTER SYSTEM NOTICE */}
                <footer style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: '#718096', fontSize: '12px' }}>
                    <AlertCircle size={14} />
                    <span>Monetization is subject to approval based on CSC guidelines.</span>
                </footer>

            </main>
        </div>
    );
}