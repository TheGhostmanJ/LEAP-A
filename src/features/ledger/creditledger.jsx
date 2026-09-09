import React from 'react';
import {
    Calendar,
    Search,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './creditledger.css';

export default function CreditLedger({ onLogout, user }) {
    return (
        <div className="cl-dashboard-container">
            <RoleSidebar user={user}/>

            {/* Added 'fade-in-up' class for entrance transition */}
            <main className="cl-main-content fade-in-up">
                {/* HEADER SECTION */}
                <header className="cl-header">
                    <div className="cl-header-title">
                        <span className="cl-header-badge">
                            <span className="cl-badge-dot"></span> CREDIT LEDGER RECORDS
                        </span>
                        <h2>
                            <span className="cl-title-dark">My </span>
                            <span className="cl-title-maroon">Credit Ledger</span>
                        </h2>
                    </div>

                    {/* Shared Header Component */}
                    <Header user={user} onLogout={onLogout} />
                </header>

                {/* 2-COLUMN METRIC SECTION */}
                <section className="cl-metrics-two-col">
                    {/* LEFT CARD: Remaining Balance */}
                    <div className="cl-summary-card card-amber-accent hover-lift">
                        <div className="cl-card-label-row">
                            <Calendar size={16} className="cl-icon-amber" />
                            <span>REMAINING CREDIT BALANCE</span>
                        </div>

                        <div className="cl-donut-content">
                            <div className="cl-donut-ring">
                                <div className="cl-donut-center">
                                    <BookOpen size={20} />
                                </div>
                            </div>

                            <div className="cl-donut-info">
                                <div className="cl-donut-value">
                                    12.5 <span className="cl-unit">Days</span>
                                </div>
                                <div className="cl-legend-list">
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-amber"></span>
                                        Sick Leave (6.25 days)
                                    </div>
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-maroon"></span>
                                        Vacation Leave (3.75 days)
                                    </div>
                                    <div className="cl-legend-entry">
                                        <span className="cl-legend-square cl-square-slate"></span>
                                        Monetizable (2.5 days)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="cl-card-footer-subtext">
                            <a href="#details">See Details →</a>
                        </div>
                    </div>

                    {/* RIGHT CARD: Credits Used / Monetized */}
                    <div className="cl-summary-card card-maroon-accent hover-lift">
                        <div className="cl-card-label-row">
                            <BookOpen size={16} className="cl-icon-maroon" />
                            <span>CREDITS USED & MONETIZED</span>
                        </div>

                        <div className="cl-progress-card-content">
                            <div className="cl-large-num">
                                5 <span className="cl-unit">Days Used This Year</span>
                            </div>

                            <div className="cl-multi-bar">
                                <div className="cl-bar-sec-1">
                                    <span>2 days</span>
                                    <span className="cl-bar-subtext">Sick Leave</span>
                                </div>
                                <div className="cl-bar-sec-2">
                                    <span>3 days</span>
                                    <span className="cl-bar-subtext">Vacation</span>
                                </div>
                                <div className="cl-bar-sec-3"></div>
                            </div>

                            <div className="cl-sub-bar-text">
                                <span>Used: 5 days</span>
                                <span>Available: 2.5 days</span>
                            </div>
                        </div>

                        <div className="cl-card-footer-subtext">
                            <a href="#breakdown">See Breakdown →</a>
                        </div>
                    </div>
                </section>

                {/* CONTROLS & FILTER ROW */}
                <section className="cl-controls-row">
                    <div className="cl-search-wrapper">
                        <Search size={14} className="cl-search-icon" />
                        <input
                            type="text"
                            placeholder="Search date, status, transaction type..."
                            className="cl-search-input"
                        />
                    </div>

                    <div className="cl-filter-actions">
                        <div className="cl-date-picker-btn">
                            <Calendar size={14} />
                            <span>May 2026</span>
                        </div>
                    </div>
                </section>

                {/* LEDGER TABLE CARD */}
                <section className="cl-table-card">
                    <div className="cl-table-header">
                        <h3>Credit Ledger Table</h3>
                        <span className="cl-table-counter">Logs updated in real-time</span>
                    </div>

                    <div className="cl-table-wrapper">
                        <table className="cl-data-table">
                            <thead>
                                <tr>
                                    <th>Date Filed</th>
                                    <th>Transaction Type</th>
                                    <th>Status</th>
                                    <th>Days</th>
                                    <th>Approver</th>
                                    <th className="cl-th-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="cl-td-bold">May 18, 2026</td>
                                    <td>Approved Leave Monetization</td>
                                    <td>
                                        <span className="cl-pill-status approved">Approved</span>
                                    </td>
                                    <td className="cl-td-bold">5 Days</td>
                                    <td>Mario C.</td>
                                    <td className="cl-td-right">
                                        <button className="cl-action-btn">
                                            View Details <ChevronRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="cl-td-bold">May 16, 2026</td>
                                    <td>Sick Leave</td>
                                    <td>
                                        <span className="cl-pill-status pending">Pending</span>
                                    </td>
                                    <td className="cl-td-bold">3 Days</td>
                                    <td>Mario C.</td>
                                    <td className="cl-td-right">
                                        <button className="cl-action-btn">
                                            View Details <ChevronRight size={12} />
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