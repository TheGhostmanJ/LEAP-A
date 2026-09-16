import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import RoleSidebar from '../../components/RoleSidebar.jsx';
import Header from '../../components/Header.jsx';
import './attendance.css';

export default function Attendance({ onLogout, user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set default to current project timeline
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Dynamic Metric States
  const [metrics, setMetrics] = useState({
    present: 0,
    tardy: 0,
    absent: 0,
    avgDelay: 0,
    totalWorkingDays: 22 // Assuming a standard 22 working day month
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.employee_key) return;
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/attendance/${user.employee_key}?month=${selectedMonth}`);
        
        if (response.ok) {
          const data = await response.json();
          setAttendanceRecords(data);
          
          // Calculate dynamic metrics from the returned dataset
          const present = data.filter(r => r.status === 'Present').length;
          const tardy = data.filter(r => r.status === 'Tardy' || r.tardy_minutes > 0).length;
          const absent = data.filter(r => r.status === 'Absent').length;
          
          const totalDelay = data.reduce((sum, r) => sum + (r.tardy_minutes || 0), 0);
          const avgDelay = tardy > 0 ? Math.round(totalDelay / tardy) : 0;
          
          setMetrics({ present, tardy, absent, avgDelay, totalWorkingDays: 22 });
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      }
    };

    fetchAttendance();
  }, [user, selectedMonth]);

  const filteredRecords = attendanceRecords.filter((rec) =>
    (rec.date && rec.date.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rec.status && rec.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rec.remarks && rec.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      <RoleSidebar user={user} />

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

          <Header user={user} onLogout={onLogout} />
        </div>

        {/* METRICS ROW CARDS */}
        <section className="attendance-metrics-grid">
          {/* Card 1: Days Present */}
          <div className="att-metric-card card-present hover-lift">
            <div className="card-top-accent accent-green"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <CheckCircle size={16} color="#16a34a" /> Days Present
              </span>
              <span className="att-card-ratio">{metrics.present}/{metrics.totalWorkingDays}</span>
            </div>
            <div className="att-main-stat text-green">
              {metrics.present} <span className="stat-unit">Days</span>
            </div>
            <div className="att-progress-bar">
              <div 
                className="att-progress-fill fill-green" 
                style={{ width: `${Math.min((metrics.present / metrics.totalWorkingDays) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="att-card-footer">
              Avg. Time In: <strong>07:51 AM</strong>
            </div>
          </div>

          {/* Card 2: Tardiness */}
          <div className="att-metric-card card-tardiness hover-lift">
            <div className="card-top-accent accent-amber"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <AlertTriangle size={16} color="#d97706" /> Tardiness
              </span>
            </div>
            <div className="att-main-stat text-amber">
              {metrics.tardy} <span className="stat-unit">Times</span>
            </div>
            <div className="att-progress-bar">
              <div 
                className="att-progress-fill fill-amber" 
                style={{ width: `${Math.min((metrics.tardy / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="att-card-footer">
              Avg. Delay: <strong>{metrics.avgDelay > 0 ? `+ ${metrics.avgDelay} Minutes` : 'None'}</strong>
            </div>
          </div>

          {/* Card 3: Absence */}
          <div className="att-metric-card card-absence hover-lift">
            <div className="card-top-accent accent-slate"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <XCircle size={16} color="#64748b" /> Absence
              </span>
            </div>
            <div className="att-main-stat text-slate">
              {metrics.absent} <span className="stat-unit">Days</span>
            </div>
            <div className="att-progress-bar">
              <div 
                className="att-progress-fill fill-slate" 
                style={{ width: `${Math.min((metrics.absent / 3) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="att-card-footer">
              <strong>{metrics.absent === 0 ? 'Excellent Streak!' : 'Careful tracking advised'}</strong>
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
            <span className="table-header-title">Attendance Ledger Table</span>
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