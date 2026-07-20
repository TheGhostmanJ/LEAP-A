import React from 'react';
import HodSidebar from '../../components/hod-sidebar';
import { Bell, AlertOctagon, ShieldAlert, CheckCircle, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import './anomaly-alert.css';

export default function AnomalyAlert({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Persistent Left Navigation Column */}
      <HodSidebar />

      {/* Main Viewport Content Surface */}
      <div className="dashboard-main-content">
        
        {/* UNIFORM GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <AlertOctagon size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Anomaly Alert</h2>
              <p className="subtitle-department">Department: <span className="highlight-maroon">City Budget Office</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="date-display-pill-btn">
              <Calendar size={16} />
              <span>May 2026</span>
            </div>

            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HOD Name'}</span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* 📊 SUMMARY CARDS HEADER GRID */}
        <section className="forecast-summary-metrics-row">
          <div className="forecast-stat-card long-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">
                <ShieldAlert size={16} className="inline-icon maroon-icon" /> Total Flagged Alerts
              </span>
            </div>
            <div className="stat-right-numbers-large text-center">
              <span className="text-maroon-value">14</span> <span className="stat-unit-label">Alerts</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill maroon-fill" style={{ width: '40%' }}></div>
            </div>
          </div>

          <div className="forecast-stat-card long-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">
                 High Risk Employees
              </span>
            </div>
            <div className="stat-right-numbers-large text-center">
              <span className="text-dark-value">3</span> <span className="stat-unit-label">Profiles</span>
            </div>
          </div>

          <div className="forecast-stat-card long-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">
                <CheckCircle size={16} className="inline-icon green-icon" /> Resolved This Month
              </span>
            </div>
            <div className="stat-right-numbers-large text-center">
              <span className="text-green-value">11</span> <span className="stat-unit-label">Profiles</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill green-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
        </section>

        {/* 🔍 FILTER & SEARCH CONTROLS */}
        <div className="table-controls-row">
          <button className="filter-icon-btn">
            <SlidersHorizontal size={16} />
          </button>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-svg" />
            <input type="text" placeholder="Search..." className="table-search-field" />
          </div>
        </div>

        {/* 📋 FLAGGED RECORDS TABLE */}
        <div className="content-data-box table-box-margin card-shadow-wrap">
          <div className="box-header-title-maroon-bar">
            <span>Flagged Records Table</span>
          </div>
          <div className="table-responsive-scroll">
            <table className="data-display-table left-aligned-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Anomaly Pattern</th>
                  <th>Score</th>
                  <th>Date Flagged</th>
                  <th className="text-center-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan Dela Cruz</td>
                  <td>Consecutive Sick Leave Spikes</td>
                  <td><span className="text-bold-danger">0.84 HIGH</span></td>
                  <td>May 17, 2026</td>
                  <td className="table-action-cell-buttons">
                    <button className="action-btn-investigate">Investigate →</button>
                    <button className="action-btn-cancel">Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}