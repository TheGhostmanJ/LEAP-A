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
    AlertCircle,
    PlusCircle,
    Briefcase,
    MapPin,
    Users
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import './trainingrecords.css'; // Importing your CSS file

export default function TrainingRecords({ onNavigate, onLogout }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Dynamic list for upcoming trainings
    const [upcomingTrainings, setUpcomingTrainings] = useState([
        { id: 1, name: 'Cybersecurity Seminar', date: 'July 5, 2026', duration: '2 Days', sponsor: 'DICT', status: 'Scheduled' }
    ]);

    // Simulated "Active Event" posted by HR Head that the employee can join
    const [hrPostedEvent, setHrPostedEvent] = useState({
        id: 202,
        name: 'Cloud Security Fundamentals',
        date: 'August 12, 2026',
        duration: '1 Day',
        sponsor: 'City HR Department',
        location: 'Main Training Hall / Hybrid',
        slotsLeft: 14,
        imagePlaceholderColor: '#610c04' // Coordinated brand color
    });

    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Action to Join the HR-Posted Event
    const handleJoinHrEvent = () => {
        if (hasJoined) return;

        const joinedItem = {
            id: hrPostedEvent.id,
            name: hrPostedEvent.name,
            date: hrPostedEvent.date,
            duration: hrPostedEvent.duration,
            sponsor: hrPostedEvent.sponsor,
            status: 'Scheduled'
        };

        setUpcomingTrainings([...upcomingTrainings, joinedItem]);
        setHasJoined(true);
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f9fa', fontFamily: 'system-ui, sans-serif' }}>
            <Sidebar />

            {/* MAIN CORE VIEW WINDOW */}
            <main className="dashboard-main-content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' }}>

                {/* UPPER HEADER */}
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
                            <span className="profile-name-label">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee'}</span>
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
                            {upcomingTrainings.length} <span style={{ fontSize: '24px', fontWeight: '700', color: '#4a080e' }}>Event{upcomingTrainings.length !== 1 ? 's' : ''}</span>
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

                {/* 3-COLUMN WORKSPACE: FIXED PRE-POSTED EVENT + UPCOMING TABLES + COMPLETED TABLES */}
                <section style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '24px', width: '100%', boxSizing: 'border-box', alignItems: 'start' }}>
                    
                    {/* COLUMN 1: NEW "JOIN PUBLIC HR EVENT" CARD DESIGN */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#4a080e', padding: '14px 20px', fontWeight: '700', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={15} />
                            <span>Available Training Event</span>
                        </div>
                        
                        {/* Event Visual Cover Block */}
                        <div className="tr-event-image-banner" style={{ backgroundColor: hrPostedEvent.imagePlaceholderColor }}>
                            <GraduationCap size={44} color="#ffffff" style={{ opacity: 0.8 }} />
                            <span className="tr-event-badge-live">New Event</span>
                        </div>

                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Featured Program
                                </span>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>
                                    {hrPostedEvent.name}
                                </h3>
                            </div>

                            {/* Non-editable details panel */}
                            <div className="tr-details-panel">
                                <div className="tr-detail-item">
                                    <Calendar size={14} className="tr-detail-icon" />
                                    <span><strong>Date:</strong> {hrPostedEvent.date}</span>
                                </div>
                                <div className="tr-detail-item">
                                    <Clock size={14} className="tr-detail-icon" />
                                    <span><strong>Duration:</strong> {hrPostedEvent.duration}</span>
                                </div>
                                <div className="tr-detail-item">
                                    <Briefcase size={14} className="tr-detail-icon" />
                                    <span><strong>Sponsor:</strong> {hrPostedEvent.sponsor}</span>
                                </div>
                                <div className="tr-detail-item">
                                    <MapPin size={14} className="tr-detail-icon" />
                                    <span><strong>Venue:</strong> {hrPostedEvent.location}</span>
                                </div>
                            </div>

                            <hr style={{ border: 0, borderTop: '1px solid #edf2f7', margin: '4px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096', fontSize: '12px' }}>
                                    <Users size={14} />
                                    <span>{hasJoined ? hrPostedEvent.slotsLeft - 1 : hrPostedEvent.slotsLeft} Slots remaining</span>
                                </div>
                            </div>

                            {/* Dynamic state join trigger */}
                            <button 
                                onClick={handleJoinHrEvent} 
                                disabled={hasJoined}
                                className={`tr-submit-button ${hasJoined ? 'joined-inactive-btn' : ''}`}
                                style={{ width: '100%', margin: 0 }}
                            >
                                {hasJoined ? '✓ Joined Successfully' : 'Join Training Event'}
                            </button>
                        </div>
                    </div>

                    {/* COLUMN 2: UPCOMING TRAININGS */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' }}>
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
                                    {upcomingTrainings.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748', fontWeight: '500' }}>{item.name}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>{item.date}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>{item.duration}</td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#2d3748' }}>{item.sponsor}</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span className="tr-status-pill-gold">
                                                    ● {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Static visual placeholders if items are low */}
                                    {upcomingTrainings.length < 2 && (
                                        <>
                                            <tr><td colSpan="5" className="tr-empty-spacer-cell">&nbsp;</td></tr>
                                            <tr><td colSpan="5" className="tr-empty-spacer-cell">&nbsp;</td></tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* COLUMN 3: COMPLETED TRAININGS */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' }}>
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
                                    <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td colSpan="5" style={{ padding: '24px 12px', fontSize: '13px', color: '#718096', textAlign: 'center', fontStyle: 'italic' }}>
                                            No completed trainings on record
                                        </td>
                                    </tr>
                                    <tr><td colSpan="5" className="tr-empty-spacer-cell">&nbsp;</td></tr>
                                    <tr><td colSpan="5" className="tr-empty-spacer-cell">&nbsp;</td></tr>
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