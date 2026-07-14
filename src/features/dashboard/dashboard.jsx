import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  Home, UserCheck, History, CreditCard, GraduationCap,
  User, HelpCircle, Clock, Bell, Search, FilePlus, ExternalLink
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import './dashboard.css';

export default function Dashboard({ onLogout, user }) { 
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentLeaves, setRecentLeaves] = useState([]);

  // Fetch data on component load
  useEffect(() => {
    const fetchRecentLeaves = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/leave/recent/${user.employee_key}`);
        if (response.ok) {
          const data = await response.json();
          setRecentLeaves(data);
        }
      } catch (err) {
        console.error("Error loading leave history:", err);
      }
    };

    if (user?.employee_key) fetchRecentLeaves();
  }, [user]);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main-content">
        <header className="content-top-header">
          <h2>Welcome, <span>{user?.first_name || 'Employee'}</span>!</h2>
          <div className="user-controls-cluster">
            <button className="icon-alert-btn"><Bell size={18} /><span className="badge-dot"></span></button>
            
            <div className="profile-identity-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar-placeholder"><User size={16} /></div>
              <span className="profile-name-label">
                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee Name'}
              </span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        {/* LEAVE METRICS ROW CARD */}
        <section className="leave-summary-metrics-bar">
          <div className="metric-cell">
            <span className="metric-title-label">Sick Leave:</span>
            <span className="metric-numeric-value">8.0 Days</span>
          </div>
          <div className="metric-cell">
            <span className="metric-title-label">Vacation Leave:</span>
            <span className="metric-numeric-value">12.5 Days</span>
          </div>
          <div className="metric-cell">
            <span className="metric-title-label">Emergency Leave:</span>
            <span className="metric-numeric-value">3.0 Days</span>
          </div>
          <div className="metric-cell action-cell">
            <span className="see-more-hyperlink" onClick={() => navigate('/leavehistory')} style={{ cursor: 'pointer' }}>
              See More →
            </span>
          </div>
        </section>

        {/* MIDDLE CHARTS / DIAGRAMS SIMULATION REGION */}
        <section className="analytics-display-grid">
          {/* Card 1: My Leave Application */}
          <div className="analytics-visual-card">
            <h3 className="card-section-title">
              <History size={16} style={{ color: '#7a0000' }} /> My Leave Application
            </h3>
            <div className="mock-graphic-frame">
              <div className="chart-flex-container">
                <div className="donut-graphic-mock">
                  <div className="donut-center-label">
                    <span className="donut-sub">TOTAL:</span>
                    <span className="donut-main">15 DAYS</span>
                  </div>
                </div>
                <div className="chart-legend-stack">
                  <div className="legend-row-item">
                    <span className="legend-swatch color-primary"></span>
                    <div>
                      <p className="legend-label">Vacation Leave</p>
                      <p className="legend-sub-label">(#680000)</p>
                    </div>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch color-secondary"></span>
                    <div>
                      <p className="legend-label">Sick Leave</p>
                      <p className="legend-sub-label">(#E7B103)</p>
                    </div>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch color-tertiary"></span>
                    <div>
                      <p className="legend-label">Emergency Leave</p>
                      <p className="legend-sub-label">(#4A5568)</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="graphic-footer-caption">My Leave Application Analysis</p>
            </div>
          </div>

          {/* Card 2: My Attendance Tracking */}
          <div className="analytics-visual-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
            <h3 className="card-section-title">
              <UserCheck size={16} style={{ color: '#7a0000' }} /> My Attendance
            </h3>
            <div className="mock-graphic-frame">
              <div className="attendance-chart-mock">
                <div className="time-stamp-marker stamp-top">🕒 07:48 AM</div>
                <div className="time-stamp-marker stamp-bottom">🕒 07:48 AM</div>

                <svg viewBox="0 0 400 100" className="sparkline-svg-vector">
                  <path
                    d="M 0 60 Q 40 40 80 70 T 160 50 T 240 75 T 320 35 T 400 55"
                    fill="none"
                    stroke="#7a0000"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0 60 Q 40 40 80 70 T 160 50 T 240 75 T 320 35 T 400 55 L 400 100 L 0 100 Z"
                    fill="rgba(122, 0, 0, 0.05)"
                  />
                  <circle cx="80" cy="70" r="4" fill="#7a0000" />
                  <circle cx="240" cy="75" r="4" fill="#7a0000" />
                  <circle cx="320" cy="35" r="4" fill="#7a0000" />
                </svg>

                <div className="axis-labels-timeline">
                  <span>Day 1</span>
                  <span>Day 10</span>
                  <span>Day 20</span>
                  <span>Day 30</span>
                </div>
              </div>

              <div className="attendance-summary-data-strip">
                <div>Current Streak: <strong>12 days</strong></div>
                <div>Avg. Check-In: <strong style={{ color: '#b27b12' }}>07:51 AM</strong></div>
              </div>
              <p className="graphic-footer-caption">My 30 Day Attendance Consistency</p>
            </div>
          </div>
        </section>

        {/* SEARCH AND INTERACTIVE TRIGGER ACTIONS CONTROLS */}
        <section className="table-filter-utilities-row">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input type="text" placeholder="Search filings..." className="utility-search-field" />
          </div>

          <button 
            className="primary-action-trigger-btn" 
            onClick={() => navigate('/leaveapplication')}
          >
            <FilePlus size={16} />
            <span>File New Leave</span>
          </button>
        </section>

        <section className="data-table-container-card">
          <div className="table-header-title-banner">Recent Leave Application Table</div>
          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Date Filed</th>
                  <th>Leave Type</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.length > 0 ? (
                  recentLeaves.map((leave, index) => (
                    <tr key={index}>
                      <td>{leave.date_key}</td>
                      <td>{leave.leave_type}</td>
                      <td>
                        <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="dimmed-empty-cell">{leave.remarks || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No recent applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}