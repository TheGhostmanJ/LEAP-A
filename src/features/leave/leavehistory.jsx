import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  FileText
} from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Header from '../../components/Header.jsx'; // Imported Header component
import './leavehistory.css';

export default function LeaveHistory({ onNavigate, onLogout, user }) {
  const navigate = useNavigate();

  // Filter States
  const [dateRange, setDateRange] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Table Data
  const [leaveRecords, setLeaveRecords] = useState([
    {
      id: 1,
      dateFiled: 'May 16, 2026',
      leaveType: 'Sick Leave',
      status: 'Pending',
      days: '3 Days',
      approver: 'Mario C.',
      remarks: 'Fever and Flu'
    },
    {
      id: 2,
      dateFiled: 'Apr 02, 2026',
      leaveType: 'Vacation Leave',
      status: 'Approved',
      days: '2 Days',
      approver: 'Mario C.',
      remarks: 'Family Outing'
    },
    {
      id: 3,
      dateFiled: 'Jan 15, 2026',
      leaveType: 'Emergency Leave',
      status: 'Approved',
      days: '1 Day',
      approver: 'Sarah L.',
      remarks: 'Home Repair'
    }
  ]);

  // Client-side filtering logic
  const filteredRecords = leaveRecords.filter((record) => {
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesType = leaveTypeFilter === 'All' || record.leaveType === leaveTypeFilter;
    const matchesSearch =
      record.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.approver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.dateFiled.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="dashboard-container">
      <Sidebar />

      {/* MAIN SYSTEM WRAPPER WITH FADE-IN ANIMATION */}
      <main className="dashboard-main-content fade-in-up">
        {/* UNIFIED TOP HEADER BAR */}
        <header className="content-top-header">
          <div className="welcome-banner-group">
            <div className="welcome-subtitle-badge">
              <span className="badge-pulse"></span> Leave Application Records
            </div>
            <h1 className="welcome-heading">
              My <span className="highlight-name">Leave History</span>
            </h1>
          </div>

          {/* Reusable Header Control Dropdown */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* TWO COLUMN METRIC PANEL */}
        <section className="analytics-display-grid">
          {/* Card 1: Remaining Leave Balance */}
          <div className="analytics-visual-card hover-lift">
            <div className="lh-card-header">
              <h3 className="card-section-title">
                <Calendar size={16} className="title-icon" /> Remaining Leave Balance
              </h3>
            </div>

            <div className="mock-graphic-frame">
              <div className="chart-flex-container">
                {/* SVG Donut */}
                <div className="donut-wrapper">
                  <svg viewBox="0 0 36 36" className="donut-chart-svg">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#680000"
                      strokeWidth="4"
                      strokeDasharray="30 70"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="4"
                      strokeDasharray="20 80"
                      strokeDashoffset="-30"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="4"
                      strokeDasharray="50 50"
                      strokeDashoffset="-50"
                    />
                  </svg>
                  <div className="donut-center-badge">
                    <Calendar size={18} className="donut-center-icon" />
                  </div>
                </div>

                {/* Legend */}
                <div className="chart-legend-stack">
                  <div className="lh-total-val-badge">12.5 Days</div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-amber"></span>
                    <span className="legend-text">Sick Leave (6.25 days)</span>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-maroon"></span>
                    <span className="legend-text">Vacation Leave (3.75 days)</span>
                  </div>
                  <div className="legend-row-item">
                    <span className="legend-swatch swatch-slate"></span>
                    <span className="legend-text">Emergency Leave (2.5 days)</span>
                  </div>
                </div>
              </div>

              <div className="lh-card-footer-action">
                <button
                  className="lh-see-more-btn"
                  onClick={() => navigate('/leaveledger')}
                >
                  See Details →
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Leaves Used Block Progress Tracking */}
          <div className="analytics-visual-card hover-lift">
            <div className="lh-card-header">
              <h3 className="card-section-title">
                <FileText size={16} className="title-icon" /> Leaves Used
              </h3>
            </div>

            <div className="mock-graphic-frame">
              <div className="lh-stat-total-display">
                <span className="lh-stat-number">5</span>
                <span className="lh-stat-unit">Days Used This Year</span>
              </div>

              {/* Progress Bar */}
              <div className="lh-progress-stacked-bar">
                <div className="bar-segment seg-sick" style={{ width: '40%' }}>
                  <span>2 days</span>
                  <span className="segment-sub">Sick Leave</span>
                </div>
                <div className="bar-segment seg-vacation" style={{ width: '40%' }}>
                  <span>3 days</span>
                  <span className="segment-sub">Vacation</span>
                </div>
                <div className="bar-segment seg-empty" style={{ width: '20%' }}></div>
              </div>

              <div className="lh-stacked-legend">
                <span>Used: <strong>5 days</strong></span>
                <span>Available: <strong>2.5 days</strong></span>
              </div>

              <div className="lh-card-footer-action">
                <button
                  className="lh-see-more-btn"
                  onClick={() => navigate('/leaveledger')}
                >
                  See Breakdown →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER CONTROLS FIELDSET ROW */}
        <section className="filter-utilities-panel">
          <div className="filter-section-title">
            <Filter size={15} color="#7a0000" /> Filter Options
          </div>

          <div className="filter-controls-grid">
            {/* Date Range */}
            <div className="filter-field-wrapper">
              <label>Date Range</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="Select dates..."
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="filter-input-element"
                />
                <Calendar size={15} className="field-icon-right" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-field-wrapper">
              <label>Status</label>
              <div className="input-with-icon">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select-element"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown size={15} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            {/* Leave Type Filter */}
            <div className="filter-field-wrapper">
              <label>Leave Type</label>
              <div className="input-with-icon">
                <select
                  value={leaveTypeFilter}
                  onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  className="filter-select-element"
                >
                  <option value="All">All Types</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
                <ChevronDown size={15} className="field-icon-right pointer-events-none" />
              </div>
            </div>

            {/* Keyword Search Field */}
            <div className="filter-field-wrapper">
              <label>Search Keywords</label>
              <div className="input-with-icon">
                <Search size={15} className="field-icon-left" />
                <input
                  type="text"
                  placeholder="Type keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input-element has-left-icon"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CORE DATA TABLE CONTAINER */}
        <section className="data-table-container-card">
          <div className="table-header-title-banner white-text-banner">
            <span>Leave Application Table</span>
            <span className="table-header-caption light-caption">
              Showing {filteredRecords.length} entries
            </span>
          </div>

          <div className="responsive-table-overflow-scroller">
            <table className="record-grid-system">
              <thead>
                <tr>
                  <th>Date Filed</th>
                  <th>Leave Type</th>
                  <th>Status</th>
                  <th>Days</th>
                  <th>Approver</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.dateFiled}</td>
                      <td>{item.leaveType}</td>
                      <td>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                          <span className="status-dot"></span>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <strong className="days-counter-label">{item.days}</strong>
                      </td>
                      <td>{item.approver}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="table-action-details-btn">
                          View Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-notice">
                      No leave history records match your criteria.
                    </td>
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