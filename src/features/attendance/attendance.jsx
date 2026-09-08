import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx'; // Adjust path as needed
import Header from '../../components/Header.jsx';
import './attendance.css';

export default function Attendance({ onLogout, user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-05');

  // Mock attendance records
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      date: 'May 18, 2026',
      timeIn: '7:51:05 AM',
      timeOut: '3:49:08 PM',
      status: 'Present',
      remarks: 'Biometric Verified'
    },
    {
      date: 'May 17, 2026',
      timeIn: '8:04:12 AM',
      timeOut: '5:01:22 PM',
      status: 'Late',
      remarks: 'Grace period (4 mins)'
    },
    {
      date: 'May 16, 2026',
      timeIn: '7:48:30 AM',
      timeOut: '4:02:15 PM',
      status: 'Present',
      remarks: 'Biometric Verified'
    }
  ]);

  const filteredRecords = attendanceRecords.filter((rec) =>
    rec.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />

      {/* Added 'fade-in-up' class for smooth page entrance transition */}
      <main className="dashboard-main-content fade-in-up">
        {/* UNIFIED TOP HEADER CONTAINER */}
        <div className="content-top-header">
          <div className="welcome-banner-group">
            <div className="welcome-subtitle-badge">
              <span className="badge-pulse"></span> Attendance Monitoring
            </div>
            <h1 className="welcome-heading">
              My <span className="highlight-name">Attendance Log</span>
            </h1>
          </div>

          {/* Reusable Header Dropdown Control */}
          <Header user={user} onLogout={onLogout} />
        </div>

        {/* METRICS ROW CARDS */}
        <section className="attendance-metrics-grid">
          {/* Card 1: Days Present */}
          <div className="att-metric-card card-present hover-lift">
            <div className="card-top-accent accent-green"></div>
            <div className="att-card-header">
              <span className="att-card-title"><CheckCircle size={16} color="#16a34a" /> Days Present</span>
              <span className="att-card-ratio">18/31</span>
            </div>
            <div className="att-main-stat text-green">
              18 <span className="stat-unit">Days</span>
            </div>
            <div className="att-progress-bar">
              <div className="att-progress-fill fill-green" style={{ width: '58%' }}></div>
            </div>
            <div className="att-card-footer">
              Avg. Time In: <strong>7:51 AM</strong>
            </div>
          </div>

          {/* Card 2: Tardiness */}
          <div className="att-metric-card card-tardiness hover-lift">
            <div className="card-top-accent accent-amber"></div>
            <div className="att-card-header">
              <span className="att-card-title"><AlertTriangle size={16} color="#d97706" /> Tardiness</span>
            </div>
            <div className="att-main-stat text-amber">
              2 <span className="stat-unit">Times</span>
            </div>
            <div className="att-progress-bar">
              <div className="att-progress-fill fill-amber" style={{ width: '15%' }}></div>
            </div>
            <div className="att-card-footer">
              Avg. Delay: <strong>+ 4 Minutes</strong>
            </div>
          </div>

          {/* Card 3: Absence */}
          <div className="att-metric-card card-absence hover-lift">
            <div className="card-top-accent accent-slate"></div>
            <div className="att-card-header">
              <span className="att-card-title"><XCircle size={16} color="#64748b" /> Absence</span>
            </div>
            <div className="att-main-stat text-slate">
              0 <span className="stat-unit">Days</span>
            </div>
            <div className="att-progress-bar">
              <div className="att-progress-fill fill-slate" style={{ width: '0%' }}></div>
            </div>
            <div className="att-card-footer">
              <strong>Excellent Streak!</strong>
            </div>
          </div>
        </section>

        {/* UTILITY / FILTER & SEARCH BAR */}
        <section className="table-filter-utilities-row">
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input
              type="text"
              placeholder="Search date, status, remarks..."
              className="utility-search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="month-picker-wrapper">
            <Calendar size={16} className="month-picker-icon" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker-input"
            />
          </div>
        </section>

        {/* DATA TABLE CARD */}
        <section className="data-table-container-card">
          <div className="table-header-title-banner">
            <span>Attendance Ledger Table</span>
            <span className="table-header-caption">Logs updated in real-time</span>
          </div>

          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
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
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{rec.date}</td>
                      <td className="time-col">{rec.timeIn}</td>
                      <td className="time-col">{rec.timeOut}</td>
                      <td>
                        <span className={`status-badge status-${rec.status.toLowerCase()}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="remarks-cell">{rec.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-notice">
                      No attendance records found for this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER NOTICE */}
        <div className="biometric-footer-notice">
          <AlertTriangle size={15} color="#d97706" />
          <span>Attendance is automatically recorded via biometric fingerprint scanning devices.</span>
        </div>
      </main>
    </div>
  );
}