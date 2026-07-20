import React from 'react';
/* =========================================================
   🛠️ IMPORT THE NEW CUSTOM HOD SIDEBAR
   ========================================================= */
import HodSidebar from "../../components/hod-sidebar";
import { Bell } from 'lucide-react';
import './hod-dashboard.css'; 

export default function HodDashboard({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Renders your brand new isolated HOD menu layout safely */}
      <HodSidebar />

      {/* Main viewport area */}
      <div className="dashboard-main-content">
        
        {/* MATCHED GLOBAL HEADER FROM FIGMA & EMPLOYEE */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting">
            Welcome, <span className="highlight-name">{user?.first_name || 'Head'}</span>!
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HOD Name'}</span>
            </div>
            
            {/* 🚪 CONNECTED LOGOUT BUTTON ACTION */}
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* METRICS TOP ROW GRID */}
        <section className="metrics-summary-row">
          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>👥 Total Employees</span>
            </div>
            <div className="card-main-stat">250</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">● Team A <b>60</b></span>
              <span className="team-tag team-b">● Team B <b>80</b></span>
              <span className="team-tag team-c">● Team C <b>40</b></span>
              <span className="team-tag team-d">● Team D <b>30</b></span>
            </div>
          </div>

          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>📅 Pending Approvals</span>
            </div>
            <div className="card-main-stat">15</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">Vacation <b>8</b></span>
              <span className="badge-stat label-sick">Sick <b>5</b></span>
              <span className="badge-stat label-emergency">Emergency <b>2</b></span>
            </div>
          </div>

          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>⚠️ Anomaly Alerts</span>
            </div>
            <div className="card-main-stat text-alert-red">4</div>
            <div className="anomaly-breakdown-pills">
              <span className="pill risk-high">2 High Risk</span>
              <span className="pill risk-medium">1 Medium Risk</span>
              <span className="pill risk-low">1 System Flag</span>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION Split Row */}
        <section className="dashboard-split-content-panel">
          {/* Left Block: Requests Table */}
          <div className="content-data-box table-box-width">
            <div className="box-header-title">Pending Leave Application Request</div>
            <div className="table-responsive-scroll">
              <table className="data-display-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Leave Type</th>
                    <th>Date</th>
                    <th>File</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Juan Dela Cruz</td>
                    <td>Sick Leave</td>
                    <td>May 16, 2026</td>
                    <td className="link-cell">View File</td>
                    <td className="link-cell">Edit</td>
                  </tr>
                  <tr>
                    <td>Susan Reyes</td>
                    <td>Vacation Leave</td>
                    <td>May 10, 2026</td>
                    <td className="link-cell">View File</td>
                    <td className="link-cell">Edit</td>
                  </tr>
                  <tr>
                    <td>Alice Lee</td>
                    <td>Maternity Leave</td>
                    <td>May 6, 2026</td>
                    <td className="link-cell">View File</td>
                    <td className="link-cell">Edit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="box-footer-action-link">
              <span>View All Request →</span>
            </div>
          </div>

          {/* Right Block: Forecast Visual Placeholder */}
          <div className="content-data-box forecast-box-width">
            <div className="box-header-title">Workforce Availability</div>
            <div className="forecast-chart-mock-body">
              <div className="chart-header-stats">
                <span>Peak: <b>95% Consistency</b> Onyx</span>
                <span>Avg. Check-In: <b>07:51 AM</b> Warm Chalk</span>
              </div>
              <div className="mock-graph-graphic-line">
                <div className="wave-placeholder-line"></div>
              </div>
              <div className="chart-footer-caption">
                <span>View Full Forecast →</span>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION Staffing Risk Banner */}
        <section className="staffing-risk-alert-banner">
          <div className="alert-banner-inner">
            <div className="alert-icon-title">
              <span className="banner-icon">🚫</span>
              <h4>Staffing Risk Alert</h4>
            </div>
            <p className="alert-description-text">
              Estimated availability: <span className="danger-text-percentage">58%</span> <br />
              System predicts severe staffing risk for the team during this period. Overlapping leave requests and seasonal trend analysis indicate a critical bottleneck. Immediate attention is required (Refer to Capitulo 6.2/8). Prescriptive rescheduling recommended.
            </p>
            <button className="view-report-banner-btn">View Report</button>
          </div>
        </section>

      </div>
    </div>
  );
}