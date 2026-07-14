import React from 'react';
import {
    UserCheck,
    Bell,
    User,
    Calendar,
    CalendarCheck,
    AlertTriangle,
    CalendarX,
    SlidersHorizontal,
    Search
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import { useAttendance } from './hooks/useAttendance';
import './attendance.css'; // Keep if you have base styles, but inline styles will handle the exact matching

export default function Attendance({ user, onLogout }) {
    // Fetches data using your established hook structure
    const { data, loading, error } = useAttendance(user?.employee_key);

    // Safeguards for rendering while fetching
    if (loading) return <div style={{ padding: '40px' }}>Loading attendance data...</div>;
    if (error) return <div style={{ padding: '40px', color: 'red' }}>Error loading data.</div>;

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4', fontFamily: 'system-ui, sans-serif' }}>
            <Sidebar />

            <main className="dashboard-main-content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' }}>
                
                {/* --- HEADER ALIGNED TO PROTOTYPE --- */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <UserCheck size={24} style={{ color: '#7a0000' }} />
                        <h2 style={{ margin: 0, padding: 0, fontSize: '24px', fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>
                            My Attendance
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Grouped Red Badges */}
                        <div style={{ display: 'flex', backgroundColor: '#7a0000', borderRadius: '8px', overflow: 'hidden' }}>
                            <button style={{ backgroundColor: 'transparent', border: 'none', padding: '8px 12px', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Bell size={18} />
                            </button>
                            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                                <User size={16} />
                                <span>{user?.full_name || 'Juan Dela Cruz'}</span>
                            </div>
                        </div>

                        <button 
                            onClick={onLogout}
                            style={{ backgroundColor: '#fff', border: '1px solid #7a0000', color: '#7a0000', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* --- DATE FILTER BUTTON --- */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Calendar size={16} style={{ color: '#7a0000' }} />
                        May 2026
                    </button>
                </div>

                {/* --- 3 METRIC CARDS ROW --- */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* Card 1: Days Present */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderBottom: '6px solid #16a34a', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                <CalendarCheck size={16} style={{ color: '#16a34a' }} />
                                <span>Days Present</span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#4b5563' }}>{data.presentDays || 18}/31</span>
                        </div>
                        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
                            <span style={{ fontSize: '42px', fontWeight: '800', color: '#16a34a', marginRight: '8px' }}>{data.presentDays || 18}</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>Days</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb', marginBottom: '12px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.percentage || 75}%`, height: '100%', backgroundColor: '#16a34a' }}></div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
                            Avg. Time In: 7:51 AM
                        </div>
                    </div>

                    {/* Card 2: Tardiness */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderBottom: '6px solid #d97706', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                <AlertTriangle size={16} style={{ color: '#d97706' }} />
                                <span>Tardiness</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
                            <span style={{ fontSize: '42px', fontWeight: '800', color: '#d97706', marginRight: '8px' }}>2</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>Times</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb', marginBottom: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '15%', height: '100%', backgroundColor: '#d97706' }}></div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#d97706' }}>
                            Avg. Delay: + 4 Minutes
                        </div>
                    </div>

                    {/* Card 3: Absence */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderBottom: '6px solid #4b5563', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                <CalendarX size={16} style={{ color: '#4b5563' }} />
                                <span>Absence</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
                            <span style={{ fontSize: '42px', fontWeight: '800', color: '#4b5563', marginRight: '8px' }}>0</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#4b5563' }}>Days</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#e5e7eb', marginBottom: '12px', overflow: 'hidden' }}>
                            <div style={{ width: '0%', height: '100%', backgroundColor: '#4b5563' }}></div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>
                            Excellent Streak!
                        </div>
                    </div>
                </section>

                {/* --- SEARCH / FILTER BAR --- */}
                <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SlidersHorizontal size={18} style={{ color: '#4a5568', cursor: 'pointer' }} />
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#a0aec0' }} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                style={{ width: '220px', padding: '8px 12px 8px 32px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} 
                            />
                        </div>
                    </div>
                </section>

                {/* --- DATA TABLE --- */}
                <section style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ backgroundColor: '#680000', padding: '14px 20px', fontWeight: '700', fontSize: '15px', color: '#fff' }}>
                        Attendance Ledger Table
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#d1d5db' }}>
                                    <th style={{ color: '#374151', fontWeight: '600', padding: '12px 20px', fontSize: '13px' }}>Date</th>
                                    <th style={{ color: '#374151', fontWeight: '600', padding: '12px 20px', fontSize: '13px' }}>Time In</th>
                                    <th style={{ color: '#374151', fontWeight: '600', padding: '12px 20px', fontSize: '13px' }}>Time Out</th>
                                    <th style={{ color: '#374151', fontWeight: '600', padding: '12px 20px', fontSize: '13px' }}>Status</th>
                                    <th style={{ color: '#374151', fontWeight: '600', padding: '12px 20px', fontSize: '13px' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1 */}
                                <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>May 18, 2026</td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>7:51:05 AM</td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>3:49:08 PM</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 24px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', display: 'inline-block', textAlign: 'center', minWidth: '60px' }}>
                                            Present
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>Biometric Verified</td>
                                </tr>
                                
                                {/* Row 2 */}
                                <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>May 17, 2026</td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>8:30:03 AM</td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>4:09:10 PM</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 24px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', display: 'inline-block', textAlign: 'center', minWidth: '60px' }}>
                                            Late
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#1f2937' }}>Biometric Verified</td>
                                </tr>
                                
                                {/* Empty Buffer Space inside table to match prototype height */}
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- FOOTER NOTICE --- */}
                <footer style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#4b5563', fontSize: '12px', fontWeight: '500' }}>
                    <AlertTriangle size={14} />
                    <span>Attendance is automatically recorded via biometric fingerprint scanning.</span>
                </footer>

            </main>
        </div>
    );
}