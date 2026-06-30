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
    CalendarPlus,
    Wallet,
    FileEdit,
    ChevronDown,
    Phone,
    Mail
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';

export default function Support({ onNavigate, onLogout }) {
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
                        <HelpCircle size={22} style={{ color: '#7a0000', display: 'flex', alignItems: 'center' }} />
                        <h2 style={{ margin: 0, padding: 0, fontSize: '24px', fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>
                            Support
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

                {/* 3-COLUMN SUMMARY TILES CARD DECK */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    
                    {/* CARD 1: File A Leave Guide */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', alignItems: 'center', gap: '20px', boxSizing: 'border-box' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: '#fff5f5', color: '#4a080e', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                            <CalendarPlus size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1a202c' }}>How to File a Leave</h3>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#a16207', cursor: 'pointer' }}>View Guide →</span>
                        </div>
                    </div>

                    {/* CARD 2: Understanding Leave Credits */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', alignItems: 'center', gap: '20px', boxSizing: 'border-box' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: '#fff5f5', color: '#4a080e', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                            <Wallet size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1a202c' }}>Understanding Leave Credits</h3>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#a16207', cursor: 'pointer' }}>View Guide →</span>
                        </div>
                    </div>

                    {/* CARD 3: Attendance Issues */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderBottom: '5px solid #4a080e', display: 'flex', alignItems: 'center', gap: '20px', boxSizing: 'border-box' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: '#fff5f5', color: '#4a080e', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                            <FileEdit size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1a202c' }}>Attendance Issues</h3>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#a16207', cursor: 'pointer' }}>View Guide →</span>
                        </div>
                    </div>
                </section>

                {/* FAQ ACCORDION SHEET PANELS */}
                <section style={{ marginBottom: '28px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4a080e', margin: '0 0 14px 0' }}>Frequently Asked Questions</h3>
                    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                            <span>How do I apply for monetization?</span>
                            <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                            <span>How to apply leave application?</span>
                            <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                            <span>What is leave credits?</span>
                            <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                        </div>
                        <div style={{ padding: '14px 24px', textAlign: 'right', backgroundColor: '#ffffff' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#4a080e', cursor: 'pointer' }}>View More Questions →</span>
                        </div>
                    </div>
                </section>

                {/* HELPDESK OFFICE DIRECTORY ROW */}
                <section style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4a080e', margin: '0 0 14px 0' }}>Still Need Help? Contact Below</h3>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px 32px', border: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#4a080e' }}>HR Support:</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                                <Phone size={14} style={{ color: '#9ca3af' }} /> <span>0123-345-1234</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563' }}>
                                <Mail size={14} style={{ color: '#9ca3af' }} /> <span>hrsupport@gmail.com</span>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#4a080e' }}>IT Support:</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                                <Phone size={14} style={{ color: '#9ca3af' }} /> <span>0321-385-1994</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4b5563' }}>
                                <Mail size={14} style={{ color: '#9ca3af' }} /> <span>itsupport@gmail.com</span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}