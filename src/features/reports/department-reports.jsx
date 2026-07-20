import React from 'react';
import HodSidebar from '../../components/hod-sidebar';
import { Bell, FileText, Calendar, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import './department-reports.css';

export default function DepartmentReports({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Persistent Left Navigation Column */}
      <HodSidebar />

      {/* Main Viewport Content Surface */}
      <div className="dashboard-main-content">
        
        {/* UNIFORM GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <FileText size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Department Reports</h2>
              <p className="subtitle-department">Department: <span className="highlight-maroon">{user?.department || 'Unassigned'}</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee'}</span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* 🛠️ FILTER OPTIONS TOOLBELT PANEL */}
        <div className="filter-options-banner-box">
          <span className="filter-panel-title">Filter Options</span>
          <div className="filter-inputs-grid-row">
            <div className="filter-field-group">
              <label>Date Range</label>
              <div className="input-with-icon-wrapper">
                <input type="text" placeholder="Select date range..." readOnly />
                <Calendar size={16} className="field-inner-icon" />
              </div>
            </div>

            <div className="filter-field-group">
              <label>Report Type</label>
              <div className="input-with-icon-wrapper">
                <select defaultValue="">
                  <option value="" disabled hidden></option>
                  <option value="leave">Leave Report</option>
                  <option value="workforce">Workforce Forecast</option>
                  <option value="anomaly">Anomaly Alert</option>
                </select>
                <ChevronDown size={16} className="field-inner-icon pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group field-flex-grow">
              <label>Search Bar</label>
              <div className="input-with-icon-wrapper">
                <Search size={16} className="field-inner-icon" />
                <input type="text" className="padding-search-input" />
              </div>
            </div>

            <div className="filter-actions-group">
              <button className="filter-sliders-btn">
                <SlidersHorizontal size={18} />
              </button>
              <button className="generate-report-submit-btn">Generate Report</button>
            </div>
          </div>
        </div>

        {/* 📊 2x2 DATA VISUALIZATIONS GRID LAYOUT */}
        <div className="reports-quad-visual-grid">
          
          {/* Card 1: Leave Distribution Type */}
          <div className="visual-report-box-card">
            <div className="visual-card-header-bar">Leave Distribution Type</div>
            <div className="visual-mock-graphic-body flex-center-content">
              {/* This represents your pie chart layout block from image_91e083.png */}
              <div className="mock-pie-chart-placeholder-frame">
                <div className="mock-pie-circle">
                  <div className="pie-segment segment-50"><span>50%</span></div>
                  <div className="pie-segment segment-30"><span>30%</span></div>
                  <div className="pie-segment segment-10-a"><span>10%</span></div>
                  <div className="pie-segment segment-10-b"><span>10%</span></div>
                </div>
                <div className="mock-pie-chart-legend">
                  <span><span className="legend-dot color-maroon"></span> Sick <strong>50%</strong></span>
                  <span><span className="legend-dot color-gold"></span> Vacation <strong>30%</strong></span>
                  <span><span className="legend-dot color-slate"></span> Emergency <strong>10%</strong></span>
                  <span><span className="legend-dot color-olive"></span> Special Privilege <strong>10%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Leave Trend */}
          <div className="visual-report-box-card">
            <div className="visual-card-header-bar">Monthly Leave Trend</div>
            <div className="visual-mock-graphic-body">
              {/* This represents your stacked bar trend from image_91e083.png */}
              <div className="mock-bar-chart-placeholder-frame">
                <div className="y-axis-ticks">
                  <span>0-50</span><span>40-40</span><span>30-30</span><span>20-20</span><span>10-10</span><span>0</span>
                </div>
                <div className="bars-container-flex">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, idx) => (
                    <div className="bar-column-group" key={month}>
                      <div className="stacked-bar-pillar">
                        <div className="stack-part maroon-part" style={{ height: `${30 + idx * 5}%` }}></div>
                        <div className="stack-part gold-part" style={{ height: `${20 + idx * 2}%` }}></div>
                        <div className="stack-part slate-part" style={{ height: `${10 + idx}%` }}></div>
                      </div>
                      <span className="bar-x-axis-label">{month}<br/><small>2026</small></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Workforce Report */}
          <div className="visual-report-box-card">
            <div className="visual-card-header-bar">Workforce Report</div>
            <div className="visual-mock-graphic-body">
              {/* This represents your line graph path trends from image_91e083.png */}
              <div className="mock-line-chart-placeholder-frame">
                <div className="mock-line-graph-trendline-svg">
                  <div className="critical-dip-marker-badge">Critical Availability Dip &lt;90%</div>
                </div>
                <div className="line-x-axis-timeline">
                  {Array.from({ length: 30 }, (_, i) => <span key={i+1}>{i+1}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Anomaly Report */}
          <div className="visual-report-box-card">
            <div className="visual-card-header-bar">Anomaly Report</div>
            <div className="visual-mock-graphic-body">
              {/* This represents your anomaly variance wave chart from image_91e083.png */}
              <div className="mock-anomaly-wave-placeholder-frame">
                <div className="anomaly-stats-sub-row">
                  <span>Peak: <strong>95% Consistency</strong></span>
                  <span>Avg. Check-In: <strong>07:51 AM</strong></span>
                </div>
                <div className="mock-wave-shaded-area">
                  <div className="wave-pulsing-node position-a"></div>
                  <div className="wave-pulsing-node position-b"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 📥 BOTTOM STICKY EXPORT ACTIONS FOOTER */}
        <div className="reports-view-bottom-export-row">
          <div className="export-dropdown-action-btn-wrapper">
            <button className="export-action-main-trigger">
              <span>Export As</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}