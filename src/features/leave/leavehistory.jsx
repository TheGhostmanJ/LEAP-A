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
    Calendar,
    ChevronDown,
    Search
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import './leavehistory.css'; // Uses your existing main layout stylesheet

export default function LeaveHistory({ onNavigate, onLogout }) {
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
        <div className="dashboard-container">
            <Sidebar />

            {/* MAIN SYSTEM WRAPPER */}
            <main className="dashboard-main-content">

                {/* CONTENT TOP HEADER BAR (CONSISTENT WITH ATTENDANCE) */}
                <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <History size={22} style={{ color: '#7a0000', display: 'flex', alignItems: 'center' }} />
                        <h2 style={{ margin: 0, padding: 0, fontSize: '22px', fontWeight: 700, color: '#1a202c', lineHeight: 1, whiteSpace: 'nowrap' }}>
                            My Leave History
                        </h2>
                    </div>

                    <div className="user-controls-cluster">
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

                {/* TWO COLUMN METRIC PANEL AS SEEN IN image_18279c.png */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    
                    {/* Card 1: Remaining Leave Balance Chart Section */}
                    <div className="attendance-metric-card" style={{ borderBottom: '4px solid #4a1521', padding: '20px', minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                            <Calendar size={16} style={{ color: '#7a0000' }} />
                            <span>Remaining [Leave] Balance</span>
                        </div>
                        
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
                            {/* Mock SVG Pie Chart representation from the original layout */}
                            <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#680000" strokeWidth="4.2" strokeDasharray="30 70" strokeDashoffset="0" />
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4A5568" strokeWidth="4.2" strokeDasharray="20 80" strokeDashoffset="-30" />
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B78103" strokeWidth="4.2" strokeDasharray="50 50" strokeDashoffset="-50" />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Calendar size={20} style={{ color: '#5a1216' }} />
                                </div>
                            </div>

                            {/* Chart Data Value Labels Cluster */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#B78103', textAlign: 'center', marginBottom: '4px' }}>12.5 Days</div>
                                <div style={{ fontSize: '11px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#B78103', borderRadius: '2px' }}></span>
                                    <span>Sick Leave (6.25 days)</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#680000', borderRadius: '2px' }}></span>
                                    <span>Vacation Leave (3.75 days)</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#4A5568', borderRadius: '2px' }}></span>
                                    <span>Emergency Leave (2.5 days)</span>
                                </div>
                            </div>
                        </div>
                        <span style={{ alignSelf: 'flex-end', fontSize: '11px', color: '#7a0000', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }}>See More →</span>
                    </div>

                    {/* Card 2: Leaves Used Block Progress Tracking Section */}
                    <div className="attendance-metric-card" style={{ borderBottom: '4px solid #4a1521', padding: '20px', minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                            <Calendar size={16} style={{ color: '#7a0000' }} />
                            <span>Leaves Used</span>
                        </div>

                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#4a1116', margin: '0 0 16px 0' }}>5 Days</h3>
                            
                            {/* Horizontal Linear Metric Bar Split Group */}
                            <div style={{ width: '80%', height: '32px', backgroundColor: '#cbd5e1', borderRadius: '6px', display: 'flex', overflow: 'hidden' }}>
                                <div style={{ width: '40%', backgroundColor: '#B78103', color: '#fff', fontSize: '10px', fontWeight: '700', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 1.1 }}>
                                    <span>2 days</span><span style={{ fontSize: '8px', fontWeight: '400' }}>Sick Leave</span>
                                </div>
                                <div style={{ width: '40%', backgroundColor: '#4a1116', color: '#fff', fontSize: '10px', fontWeight: '700', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 1.1 }}>
                                    <span>3 days</span><span style={{ fontSize: '8px', fontWeight: '400' }}>Vacation Leave</span>
                                </div>
                                <div style={{ width: '20%' }}></div>
                            </div>

                            <div style={{ width: '80%', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginTop: '10px', fontWeight: '500' }}>
                                <span>Used: 5 days</span>
                                <span>Available: 2.5 days</span>
                            </div>
                        </div>
                        <span style={{ alignSelf: 'flex-end', fontSize: '11px', color: '#7a0000', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }}>See More →</span>
                    </div>
                </section>

                {/* FILTER CONTROLS FIELDSET ROW */}
                <section style={{ border: '1px solid #996666', borderRadius: '6px', padding: '16px', marginBottom: '24px', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#7a0000', marginBottom: '12px', marginTop: '-4px' }}>Filter Options</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>Date Range</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input type="text" placeholder="Select dates..." style={{ width: '100%', padding: '6px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                                <Calendar size={14} style={{ position: 'absolute', right: '10px', color: '#a0aec0' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>Status Filter</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <select style={{ width: '100%', padding: '6px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', appearance: 'none', backgroundColor: '#fff' }}>
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', color: '#a0aec0', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>Leave Type Filter</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <select style={{ width: '100%', padding: '6px 12px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', appearance: 'none', backgroundColor: '#fff' }}>
                                    <option value="">All Types</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="vacation">Vacation Leave</option>
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', color: '#a0aec0', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>Search Bar</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input type="text" placeholder="Type keywords..." style={{ width: '100%', padding: '6px 12px 6px 28px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#a0aec0' }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CORE SYSTEM DATA GRID ARCHITECTURE */}
                <section className="data-table-container-card" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                    <div className="table-header-title-banner" style={{ backgroundColor: '#4a080e', padding: '14px 20px', fontWeight: '700' }}>
                        Leave Application Table
                    </div>
                    <div className="responsive-table-overflow-scroller">
                        <table className="record-grid-system">
                            <thead>
                                <tr style={{ backgroundColor: '#cbd5e1' }}>
                                    <th style={{ color: '#4a5568', fontWeight: '600' }}>Date Filed</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600' }}>Leave Type</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600' }}>Status</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600' }}>Days</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600' }}>Approver</th>
                                    <th style={{ color: '#4a5568', fontWeight: '600', textTransform: 'none' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>May 16, 2026</td>
                                    <td>Sick Leave</td>
                                    <td>
                                        <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '6px', height: '6px', backgroundColor: '#D97706', borderRadius: '50%' }}></span>
                                            Pending
                                        </span>
                                    </td>
                                    <td>3 Days</td>
                                    <td>Mario C.</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button style={{ backgroundColor: '#680000', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                            View Details →
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>
        </div>
    );
}