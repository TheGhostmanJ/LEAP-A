import React, { useState } from 'react';
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
import './attendance.css';

export default function Attendance({ user, onLogout }) {
    const { data, loading, error } = useAttendance(user?.employee_key);
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return <div className="loading-container">Loading attendance data...</div>;
    if (error) return <div className="error-container">Error loading attendance records.</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="dashboard-main-content">
                
                {/* --- HEADER --- */}
                <header className="content-header">
                    <div className="page-title-cluster">
                        <UserCheck size={24} className="maroon-header-icon" />
                        <h2>My Attendance</h2>
                    </div>

                    <div className="user-controls-cluster">
                        <div className="grouped-user-badge">
                            <button className="icon-alert-btn" aria-label="Notifications">
                                <Bell size={18} />
                                <span className="badge-dot"></span>
                            </button>
                            <div className="profile-identity-card">
                                <User size={16} />
                                <span className="profile-name-label">{user?.full_name || 'Juan Dela Cruz'}</span>
                            </div>
                        </div>

                        <button onClick={onLogout} className="logout-action-btn">
                            Log Out
                        </button>
                    </div>
                </header>

                {/* --- DATE FILTER --- */}
                <div className="calendar-filter-row">
                    <button className="calendar-picker-bubble">
                        <Calendar size={16} className="maroon-text-icon" />
                        <span>May 2026</span>
                    </button>
                </div>

                {/* --- METRIC CARDS --- */}
                <section className="attendance-metrics-grid">
                    
                    {/* Card 1: Days Present */}
                    <div className="attendance-metric-card status-present">
                        <div className="card-top-info">
                            <div className="card-top-title-group">
                                <CalendarCheck size={16} className="text-present" />
                                <span className="card-top-title">Days Present</span>
                            </div>
                            <span className="card-top-stat">{data?.presentDays || 18}/31</span>
                        </div>
                        <div className="card-center-value text-present">
                            {data?.presentDays || 18} <span className="card-value-unit">Days</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill fill-present" style={{ width: `${data?.percentage || 75}%` }}></div>
                        </div>
                        <div className="card-footer-caption text-present">
                            Avg. Time In: 7:51 AM
                        </div>
                    </div>

                    {/* Card 2: Tardiness */}
                    <div className="attendance-metric-card status-late">
                        <div className="card-top-info">
                            <div className="card-top-title-group">
                                <AlertTriangle size={16} className="text-late" />
                                <span className="card-top-title">Tardiness</span>
                            </div>
                        </div>
                        <div className="card-center-value text-late">
                            2 <span className="card-value-unit">Times</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill fill-late" style={{ width: '15%' }}></div>
                        </div>
                        <div className="card-footer-caption text-late">
                            Avg. Delay: + 4 Minutes
                        </div>
                    </div>

                    {/* Card 3: Absence */}
                    <div className="attendance-metric-card status-absent">
                        <div className="card-top-info">
                            <div className="card-top-title-group">
                                <CalendarX size={16} className="text-absent" />
                                <span className="card-top-title">Absence</span>
                            </div>
                        </div>
                        <div className="card-center-value text-absent">
                            0 <span className="card-value-unit">Days</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill fill-absent" style={{ width: '0%' }}></div>
                        </div>
                        <div className="card-footer-caption text-italic-muted">
                            Excellent Streak!
                        </div>
                    </div>
                </section>

                {/* --- SEARCH / FILTER ROW --- */}
                <section className="attendance-table-search-row">
                    <div className="inline-search-alignment-cluster">
                        <SlidersHorizontal size={18} className="filter-icon-toggle" />
                        <div className="search-input-wrapper">
                            <Search size={14} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search recent filings..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </section>

                {/* --- TABLE --- */}
                <section className="ledger-table-card">
                    <div className="ledger-table-header">
                        <h3>Attendance Ledger Table</h3>
                    </div>
                    <div className="table-responsive-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time In</th>
                                    <th>Time Out</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>May 18, 2026</td>
                                    <td>7:51:05 AM</td>
                                    <td>3:49:08 PM</td>
                                    <td>
                                        <span className="ledger-status-badge badge-present-light">
                                            Present
                                        </span>
                                    </td>
                                    <td>Biometric Verified</td>
                                </tr>
                                <tr>
                                    <td>May 17, 2026</td>
                                    <td>8:30:03 AM</td>
                                    <td>4:09:10 PM</td>
                                    <td>
                                        <span className="ledger-status-badge badge-late-light">
                                            Late
                                        </span>
                                    </td>
                                    <td>Biometric Verified</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- FOOTER NOTICE --- */}
                <footer className="biometric-disclaimer-notice">
                    <AlertTriangle size={14} className="muted-gray-icon" />
                    <span>Attendance is automatically recorded via biometric fingerprint scanning.</span>
                </footer>

            </main>
        </div>
    );
}