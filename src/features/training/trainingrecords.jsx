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
    Award,
    Calendar,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';

export default function TrainingRecords({ onNavigate, onLogout }) {
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

            {/* MAIN CORE VIEW WINDOW */}
            <main className="dashboard-main-content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' }}>

                {/* UPPER HEADER - ALIGNED WITH PREVIOUS PAGES */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <GraduationCap size={22} style={{ color: '#7a0000', display: 'flex', alignItems: 'center' }} />
                        <h2 style={{ margin: 0, padding: 0, fontSize: '24px', fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>
                            My Training Records
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

                {/* 3-COLUMN METRICS ROW TRACK */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* CARD 1: Total Trainings */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <CheckCircle2 size={14} style={{ color: '#800000' }} />
                            <span>Total Trainings</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#4a080e', margin: '24px 0', lineHeight: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '10px' }}>
                            0 <span style={{ fontSize: '24px', fontWeight: '700', color: '#4a080e' }}>Completed</span>
                        </div>
                    </div>

                    {/* CARD 2: Certifications Earned */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #a16207', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <Award size={14} style={{ color: '#b45309' }} />
                            <span>Certifications Earned</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#ca8a04', margin: '24px 0', lineHeight: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '10px' }}>
                            5 <span style={{ fontSize: '24px', fontWeight: '700', color: '#ca8a04' }}>Active</span>
                        </div>
                    </div>

                    {/* CARD 3: Upcoming Trainings */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '14px' }}>
                            <Calendar size={14} style={{ color: '#800000' }} />
                            <span>Upcoming Trainings</span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', color: '#4a080e', margin: '24px 0', lineHeight: 1, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '10px' }}>
                            1 <span style={{ fontSize: '24px', fontWeight: '700', color: '#4a080e' }}>Event</span>
                        </div>
                    </div>
                </section>

                {/* SEARCH/FILTER ROW TRACK */}
                <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SlidersHorizontal size={18} style={{ color: '#4a5568', cursor: 'pointer' }} />
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#a0aec0' }} />
                            <input type="text" placeholder="Search..." style={{ width: '220px', padding: '6px 12px 6px 32px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        </div>
                    </div>
                </section>

                {/* SIDE-BY-SIDE MATRIX LAYOUT FOR TABLES */}
                <section style={{ display: 'flex', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* LEFT SYSTEM: UPCOMING TRAININGS */}
                    <div style={{ flex: 1, background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ backgroundColor: '#4a080e', padding: '14px 20px', fontWeight: '700', fontSize: '14px', color: '#fff' }}>
                            Upcoming Trainings
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#cbd5e1' }}>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Training Name</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Date</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Duration</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Sponsor</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>Cybersecurity Seminar</td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>July 5, 2026</td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>2 Days</td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>DICT</td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', border: '1px solid #fde68a', display: 'inline-block' }}>
                                                ● Scheduled
                                            </span>
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}><td colSpan="5" style={{ padding: '20px' }}>&nbsp;</td></tr>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}><td colSpan="5" style={{ padding: '20px' }}>&nbsp;</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT SYSTEM: COMPLETED TRAININGS */}
                    <div style={{ flex: 1, background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ backgroundColor: '#4a080e', padding: '14px 20px', fontWeight: '700', fontSize: '14px', color: '#fff' }}>
                            Completed Trainings
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#cbd5e1' }}>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Training Name</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Date</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Hours</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Sponsor</th>
                                        <th style={{ color: '#4a5568', fontWeight: '600', padding: '12px', fontSize: '13px' }}>Certificate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}><td colSpan="5" style={{ padding: '20px' }}>&nbsp;</td></tr>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}><td colSpan="5" style={{ padding: '20px' }}>&nbsp;</td></tr>
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}><td colSpan="5" style={{ padding: '20px' }}>&nbsp;</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* BOTTOM WARNING COMPLIANCE NOTICE */}
                <footer style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', color: '#718096', fontSize: '12px' }}>
                    <AlertCircle size={14} />
                    <span>Training hours are synchronized directly with your official HR record updates.</span>
                </footer>

            </main>
        </div>
    );
}