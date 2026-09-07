import React from 'react';
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';
import { AlertOctagon, ShieldAlert, CheckCircle, Search, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import './anomaly-alert.css';

export default function AnomalyAlert({ onLogout, user }) {
  const renderSidebar = () => {
    switch (user?.role) {
      case 'HR Admin':
        return <HrSidebar />;
      case 'Department Head':
      default:
        return <HodSidebar />;
    }
  };

  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Navigation Column */}
      {renderSidebar()}

      {/* Main Viewport Content Surface with entrance animation */}
      <main className="dashboard-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <AlertOctagon size={24} className="tr-icon-maroon" /> 
            <div className="title-text-group">
              <h2>
                <span className="cl-title-dark">Anomaly</span> <span className="cl-title-maroon">Alerts</span>
              </h2>
              <p className="subtitle-department">
                Department: <span className="highlight-maroon">{user?.department || 'City Budget Office'}</span>
              </p>
            </div>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* SUMMARY CARDS HEADER GRID */}
        <section className="forecast-summary-metrics-row">
          <div className="forecast-stat-card long-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">
                <ShieldAlert size={16} className="inline-icon maroon-icon" /> Total Flagged Alerts
              </span>
            </div>
            <div className="stat-right-numbers-large">
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
            <div className="stat-right-numbers-large">
              <span className="text-dark-value">3</span> <span className="stat-unit-label">Profiles</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill red-fill" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="forecast-stat-card long-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">
                <CheckCircle size={16} className="inline-icon green-icon" /> Resolved This Month
              </span>
            </div>
            <div className="stat-right-numbers-large">
              <span className="text-green-value">11</span> <span className="stat-unit-label">Profiles</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill green-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
        </section>

        {/* FILTER & SEARCH CONTROLS */}
        <div className="table-controls-row">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-svg" />
            <input type="text" placeholder="Search employee or anomaly..." className="table-search-field" />
          </div>
          <button type="button" className="filter-icon-btn" aria-label="Filter records">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* FLAGGED RECORDS TABLE */}
        <div className="content-data-box table-box-margin card-shadow-wrap">
          <div className="box-header-title">
            <span>Flagged Anomaly Records</span>
          </div>
          <div className="table-responsive-scroll">
            <table className="data-display-table left-aligned-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Anomaly Pattern</th>
                  <th>Risk Score</th>
                  <th>Date Flagged</th>
                  <th className="text-center-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Juan Dela Cruz</td>
                  <td>Consecutive Sick Leave Spikes</td>
                  <td>
                    <span className="risk-pill-high">0.84 HIGH</span>
                  </td>
                  <td>May 17, 2026</td>
                  <td className="table-action-cell-buttons">
                    <button type="button" className="action-btn-investigate">
                      Investigate <ArrowRight size={14} />
                    </button>
                    <button type="button" className="action-btn-cancel">
                      <X size={14} /> Dismiss
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}