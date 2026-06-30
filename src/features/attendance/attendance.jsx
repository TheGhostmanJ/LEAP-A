import React from 'react';
import './attendance.css';
import { useAttendance } from './hooks/useAttendance';

const Attendance = () => {
  // All the complex logic is hidden away here
  const { data, loading, error } = useAttendance();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data.</div>;

  return (
    <div className="attendance-container">
      {/* Header Section */}
      <div className="content-header">
        <div className="page-title-cluster">
          <div className="maroon-header-icon">{/* Icon */}</div>
          <h2>Attendance</h2>
        </div>
        <div className="user-controls-cluster">
          <button className="icon-alert-btn">
            <span className="badge-dot"></span>
          </button>
          <div className="profile-identity-card">
            <div className="avatar-placeholder">A</div>
            <span className="profile-name-label">Employee Name</span>
          </div>
          <button className="logout-action-btn">Logout</button>
        </div>
      </div>

      {/* 2. CALENDAR FILTER */}
      <div className="calendar-filter-row">
        <div className="calendar-picker-bubble">
          <span className="maroon-text-icon">{/* Calendar Icon */}</span>
          Select Date Range
        </div>
      </div>

      {/* Metrics Grid populated by state */}
      <div className="attendance-metrics-grid">
        <div className="attendance-metric-card">
          <div className="card-top-info">
            <span className="card-top-title">Total Present</span>
            <span className="card-top-stat">{attendanceData.presentDays} Days</span>
          </div>
          <div className="card-center-value">
            {attendanceData.percentage} <span className="card-value-unit">%</span>
          </div>
          <div className="card-footer-caption">Based on current cycle</div>
        </div>
      </div>
      
      {/* 4. SEARCH & TABLE */}
      <div className="attendance-table-search-row">
        <div className="inline-search-alignment-cluster">
          {/* Add your Search Input here */}
          <div className="filter-icon-toggle">{/* Filter Icon */}</div>
        </div>
      </div>
      
      {/* Example Status Badge Usage in your Table */}
      <span className="ledger-status-badge badge-present-light">Present</span>

      {/* 5. FOOTER */}
      <footer className="biometric-disclaimer-notice">
        <AlertCircle size={14} className="muted-gray-icon" />
        <span>Attendance is automatically recorded via biometric fingerprint scanning.</span>
      </footer>
    </div>
  );
};

export default Attendance;