import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import HodSidebar from '../../components/hod-sidebar'; 
import HrSidebar from '../../components/hr-sidebar'; 
import { User, Bell, BarChart3, Info, AlertTriangle, AlertCircle, SlidersHorizontal } from 'lucide-react';
import './workforce-forecast.css';

export default function WorkforceForecast({ onLogout, user }) {
  const navigate = useNavigate();

  const renderSidebar = () => {
            switch (user?.role) {
                case 'HR Admin':
                    return <HrSidebar />;
                case 'Department Head':
                    return <HodSidebar />;
            }
        };

  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Persistent Left Navigation Column */}
      {renderSidebar()}

      {/* Main Viewport Content Surface */}
      <div className="dashboard-main-content">
        
        {/* UNIFORM GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <BarChart3 size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>Workforce Forecast</h2>
              <p className="subtitle-department">Department: <span className="highlight-maroon">{user?.department || 'Unassigned'}</span></p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="profile-identity-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar-placeholder"><User size={16} /></div>
              <span className="profile-name-label">
                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee Name'}
              </span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* 📊 SUMMARY CARDS HEADER GRID */}
        <section className="forecast-summary-metrics-row">
          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">Total Staff:</span>
              <span className="stat-subtext-label">Active Employees: 230</span>
            </div>
            <div className="stat-right-numbers text-green-value">250</div>
            <Info size={14} className="card-info-indicator" />
          </div>

          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">Available Staff:</span>
            </div>
            <div className="stat-right-numbers text-dark-value">210</div>
            <Info size={14} className="card-info-indicator" />
          </div>

          <div className="forecast-stat-card">
            <div className="stat-left-labels">
              <span className="stat-main-label">On Leave:</span>
              <span className="stat-subtext-label">Pending Approvals: 15</span>
            </div>
            <div className="stat-right-numbers text-yellow-value">8</div>
          </div>
        </section>

        {/* 🔀 TWO-COLUMN GRID LAYOUT (MATCHES FIGMA / IMAGE REFERENCE) */}
        <div className="forecast-grid-split">
          
          {/* LEFT SIDE PANELS */}
          <div className="forecast-left-column">
            
            {/* 30 Day Availability Graph Box */}
            <div className="content-data-box main-chart-box">
              <div className="box-header-title space-between-header">
                <span>30 Day Workforce Availability Forecast</span>
                <SlidersHorizontal size={14} className="header-filter-icon" />
              </div>
              <div className="chart-wrapper-body">
                {/* Embedded UI Vector Line Asset Graphic directly matching your design */}
                <div className="mock-svg-graph-container">
                  <div className="y-axis-labels">
                    <span>75-100%</span>
                    <span>90%</span>
                    <span>85%</span>
                    <span>90%</span>
                    <span>75%</span>
                  </div>
                  <div className="graph-image-mask">
                    {/* Placeholder image representation matching image_9082eb.png line trends */}
                    <div className="mock-graph-vector-line"></div>
                    <div className="critical-dip-marker-pulse">
                      <span className="critical-label-pill">Critical Availability Dip &lt;90%</span>
                    </div>
                  </div>
                </div>
                {/* Timeline Grid X-Axis */}
                <div className="x-axis-timeline-wrapper">
                  <div className="x-axis-spacer"></div>
                  <div className="x-axis-days">
                    {Array.from({ length: 30 }, (_, i) => <span key={i+1}>{i+1}</span>)}
                  </div>
                </div>
                {/* Legend Rules */}
                <div className="graph-footer-legend">
                  <span className="legend-item"><span className="legend-line maroon-line"></span> Current Forecast</span>
                  <span className="legend-item"><span className="legend-line dashed-line"></span> Historical Avg</span>
                  <span className="legend-item"><span className="legend-square gray-box"></span> Weekend <Info size={10} style={{ marginLeft: '2px' }} /></span>
                </div>
              </div>
              <div className="box-footer-action-link text-right">
                <span>View Full Forecast →</span>
              </div>
            </div>

            {/* Workforce Availability Table */}
            <div className="content-data-box table-box-margin">
              <div className="box-header-title space-between-header">
                <span>Workforce Availability Table</span>
                <SlidersHorizontal size={14} className="header-filter-icon" />
              </div>
              <div className="table-responsive-scroll">
                <table className="data-display-table centered-header-table">
                  <thead>
                    <tr>
                      <th>Date Range</th>
                      <th>Available Staffs</th>
                      <th>Required</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>May 1-15</td>
                      <td>225</td>
                      <td>200</td>
                      <td><span className="risk-badge risk-badge-low">Low Risk</span></td>
                    </tr>
                    <tr>
                      <td>May 16-18</td>
                      <td>215</td>
                      <td>200</td>
                      <td><span className="risk-badge risk-badge-moderate">Moderate Risk</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE PANELS */}
          <div className="forecast-right-column">
            
            {/* Staffing Risk Alert Card */}
            <div className="content-data-box paddingless-box shadow-card">
              <div className="box-header-title">Staffing Risk Alert</div>
              <div className="alert-list-wrapper">
                
                <div className="alert-item-row">
                  <AlertCircle size={18} className="alert-icon-red" />
                  <p className="alert-text">
                    <span className="alert-bold-tag text-red">Critical Dip:</span> May 20–22 availability dips below 90% threshold.
                  </p>
                </div>

                <div className="alert-item-row">
                  <AlertTriangle size={18} className="alert-icon-yellow" />
                  <p className="alert-text">
                    <span className="alert-bold-tag text-yellow">Team Congestion:</span> Engineering Team availability below required (9/15 staffs).
                  </p>
                </div>

                <div className="alert-item-row">
                  <AlertTriangle size={18} className="alert-icon-yellow" />
                  <p className="alert-text">
                    <span className="alert-bold-tag text-yellow">Concurrent Leaves:</span> 5 staffs have overlapping leaves.
                  </p>
                </div>

              </div>
            </div>

            {/* Automated Scheduling Suggestion Box */}
            <div className="content-data-box border-suggestion-box shadow-card">
              <div className="box-header-title bg-transparent text-maroon-title">
                <AlertCircle size={18} className="suggestion-title-icon" /> Automated Scheduling Suggestion:
              </div>
              <div className="suggestion-inner-body">
                <p className="suggestion-description">
                  For the May 20-22 risk period, it is recommended to defer 3 of the 5 pending Staff Team leave requests to June 1-5. This restores Staff Team minimum requirement and mitigates critical dip.
                </p>
                <button className="apply-deferral-action-btn">Apply Deferral Plan</button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}