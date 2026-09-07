import React from 'react';
import HrSidebar from '../../components/hr-sidebar';
import HodSidebar from '../../components/hod-sidebar';
import Header from '../../components/Header';
import { FileText, Calendar, ChevronDown, Search, SlidersHorizontal, Download } from 'lucide-react';
import './department-reports.css';

export default function DepartmentReports({ onLogout, user }) {
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
            <FileText size={24} className="tr-icon-maroon" /> 
            <div className="title-text-group">
              <h2>
                <span className="cl-title-dark">Department</span> <span className="cl-title-maroon">Reports</span>
              </h2>
              <p className="subtitle-department">
                Department: <span className="highlight-maroon">{user?.department || 'Unassigned'}</span>
              </p>
            </div>
          </div>
          
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* FILTER OPTIONS TOOLBELT PANEL */}
        <div className="filter-options-banner-box">
          <span className="filter-panel-title">Filter Options</span>
          <div className="filter-inputs-grid-row">
            <div className="filter-field-group">
              <label htmlFor="date-range-input">Date Range</label>
              <div className="input-with-icon-wrapper">
                <input id="date-range-input" type="text" placeholder="Select date range..." readOnly />
                <Calendar size={16} className="field-inner-icon right-icon" />
              </div>
            </div>

            <div className="filter-field-group">
              <label htmlFor="report-type-select">Report Type</label>
              <div className="input-with-icon-wrapper">
                <select id="report-type-select" defaultValue="">
                  <option value="" disabled hidden>Select report type...</option>
                  <option value="leave">Leave Report</option>
                  <option value="workforce">Workforce Forecast</option>
                  <option value="anomaly">Anomaly Alert</option>
                </select>
                <ChevronDown size={16} className="field-inner-icon right-icon pointer-events-none" />
              </div>
            </div>

            <div className="filter-field-group field-flex-grow">
              <label htmlFor="report-search-input">Search Bar</label>
              <div className="input-with-icon-wrapper">
                <Search size={16} className="field-inner-icon left-icon" />
                <input id="report-search-input" type="text" placeholder="Search parameters..." className="padding-search-input" />
              </div>
            </div>

            <div className="filter-actions-group">
              <button type="button" className="filter-sliders-btn" aria-label="Toggle Advanced Filters">
                <SlidersHorizontal size={18} />
              </button>
              <button type="button" className="generate-report-submit-btn">Generate Report</button>
            </div>
          </div>
        </div>

        {/* 2x2 DATA VISUALIZATIONS GRID LAYOUT */}
        <div className="reports-quad-visual-grid">
          
          {/* Card 1: Leave Distribution Type */}
          <div className="visual-report-box-card">
            <div className="visual-card-header-bar">Leave Distribution Type</div>
            <div className="visual-mock-graphic-body flex-center-content">
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
              <div className="mock-bar-chart-placeholder-frame">
                <div className="y-axis-ticks">
                  <span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
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

        {/* BOTTOM EXPORT ACTIONS FOOTER */}
        <div className="reports-view-bottom-export-row">
          <div className="export-dropdown-action-btn-wrapper">
            <button type="button" className="export-action-main-trigger">
              <Download size={15} />
              <span>Export As</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}