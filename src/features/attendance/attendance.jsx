import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, AlertTriangle, CheckCircle, XCircle, TrendingUp
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
          // Sort data chronologically for the graph (oldest to newest)
          const sortedData = [...data].reverse(); 
          setAttendanceRecords(sortedData);
          
          // Calculate dynamic metrics from the returned dataset
          const present = data.filter(r => r.status === 'Present' || r.status === 'Tardy').length;
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

  const filteredRecords = [...attendanceRecords].reverse().filter((rec) =>
    (rec.date && rec.date.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rec.status && rec.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rec.remarks && rec.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to generate the SVG Line Graph for Check-In Times
  const generateTrendLine = () => {
    // Filter out absences so they don't break the line
    const presentRecords = attendanceRecords.filter(r => r.status !== 'Absent' && r.timeIn !== '—');
    if (presentRecords.length < 2) return "";

    const points = presentRecords.map((day, index) => {
      // X axis: spread points evenly across the SVG width
      const x = (index / (presentRecords.length - 1)) * 100;
      
      // Y axis: Convert TimeIn to a numeric value (e.g., 8:15 AM = 8.25)
      const timeParts = day.timeIn.match(/(\d+):(\d+) (AM|PM)/);
      if (!timeParts) return `${x},50`; // Fallback middle if parsing fails

      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[3];

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const timeNumeric = hours + (minutes / 60);

      // Map time to Y-axis. Let's say 7:00 AM (7.0) is the top (0%), and 9:00 AM (9.0) is the bottom (100%)
      // If they check in at 8:00 AM (8.0), it will be right in the middle (50%)
      let y = ((timeNumeric - 7.0) / 2.0) * 100; 
      
      // Clamp values so it doesn't draw outside the box
      y = Math.max(5, Math.min(95, y)); 

      return `${x},${y}`;
    });

    return points.join(' ');
  };

  return (
    <div className="app-layout-wrapper">
      <RoleSidebar user={user} />

      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* UNIFIED TOP HEADER */}
        <header className="app-global-header">
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS ROW CARDS */}
        <section className="attendance-metrics-grid">
          
          {/* Card 1: Days Present */}
          <div className="app-card att-metric-card hover-lift">
            <div className="card-top-accent accent-green"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <CheckCircle size={16} color="var(--color-success)" /> Days Present
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
              Progress towards required 22 working days
            </div>
          </div>

          {/* Card 2: Tardiness with ML-Style Trend Graph */}
          <div className="app-card att-metric-card hover-lift">
            <div className="card-top-accent accent-amber"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <TrendingUp size={16} color="var(--color-warning)" /> Arrival Time Trend
              </span>
            </div>
            
            <div className="att-graph-container" style={{ height: '40px', width: '100%', marginTop: '8px' }}>
              {attendanceRecords.length > 1 ? (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <polyline 
                    points={generateTrendLine()} 
                    fill="none" 
                    stroke="var(--color-warning)" 
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Draw a dotted line for 8:00 AM target */}
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                </svg>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '10px' }}>
                  Insufficient data for trend line
                </div>
              )}
            </div>

            <div className="att-card-footer" style={{ marginTop: 'auto' }}>
              Avg. Delay: <strong>{metrics.avgDelay > 0 ? `+ ${metrics.avgDelay} Minutes` : 'None (On Time)'}</strong>
            </div>
          </div>

          {/* Card 3: Absence */}
          <div className="app-card att-metric-card hover-lift">
            <div className="card-top-accent accent-slate"></div>
            <div className="att-card-header">
              <span className="att-card-title">
                <XCircle size={16} color="var(--color-text-secondary)" /> Absence
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
        <section className="table-filter-utilities-row" style={{ marginTop: '24px' }}>
          <div className="search-bar-input-wrapper">
            <Search size={16} className="search-lens-embed" />
            <input
              type="text"
              placeholder="Search date, status, remarks..."
              className="app-search-input"
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
              className="app-search-input"
              style={{ paddingLeft: '38px', width: '200px', cursor: 'pointer' }}
            />
          </div>
        </section>

        {/* DATA TABLE CARD */}
        <section className="app-card data-table-container-card" style={{ marginTop: '16px' }}>
          <div className="app-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Attendance Ledger Table</span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Logs updated in real-time</span>
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
        <div className="biometric-footer-notice" style={{ marginTop: '16px' }}>
          <AlertTriangle size={15} color="var(--color-warning)" />
          <span>Attendance is automatically recorded via biometric fingerprint scanning devices.</span>
        </div>
      </main>
    </div>
  );
}
