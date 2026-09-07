// src/pages/hr-dashboard/HrDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Ban
} from 'lucide-react';

/* =========================================================
   🛠️ IMPORT CUSTOM HR SIDEBAR & SHARED HEADER
   ========================================================= */
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import './hod-dashboard.css'; // Reusing common dashboard styles

export default function HrDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const [recentLeaves, setRecentLeaves] = useState([]);

  // Fetch recent leave data on component load
  useEffect(() => {
    const fetchRecentLeaves = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/leave/recent/${user.employee_key}`);
        if (response.ok) {
          const data = await response.json();
          setRecentLeaves(data);
        }
      } catch (err) {
        console.error("Error loading leave history:", err);
      }
    };

    if (user?.employee_key) fetchRecentLeaves();
  }, [user]);

  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Navigation Column */}
      <HrSidebar />

      {/* Main Viewport Area */}
      <main className="dashboard-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting">
            Welcome, <span className="highlight-name">{user?.first_name || 'HR Admin'}</span>!
          </div>

          {/* Revised Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS ROW - City-Wide Scope */}
        <section className="metrics-summary-row">
          
          {/* Card 1: Total City Workforce */}
          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <Users size={16} className="tr-icon-maroon" />
              <span>Total City Workforce</span>
            </div>
            <div className="card-main-stat">1,450</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">● Active <b>1,410</b></span>
              <span className="team-tag team-b">● On Leave <b>40</b></span>
            </div>
          </div>

          {/* Card 2: Pending Profile Edits */}
          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <FileCheck size={16} className="tr-icon-amber" />
              <span>Pending Profile Edits</span>
            </div>
            <div className="card-main-stat">12</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">Civil Status <b>5</b></span>
              <span className="badge-stat label-sick">Contact Info <b>7</b></span>
            </div>
          </div>

          {/* Card 3: Master Anomaly Alerts */}
          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <AlertTriangle size={16} className="tr-icon-maroon" />
              <span>Master Anomaly Alerts</span>
            </div>
            <div className="card-main-stat text-alert-red">18</div>
            <div className="anomaly-breakdown-pills">
              <span className="pill risk-high">5 High</span>
              <span className="pill risk-medium">8 Med</span>
              <span className="pill risk-low">5 Low</span>
            </div>
          </div>

        </section>

        {/* MIDDLE SECTION Split Row */}
        <section className="dashboard-split-content-panel">
          
          {/* Left Block: Requests Table */}
          <div className="content-data-box table-box-width">
            <div className="box-header-title">Pending Leave Application Requests</div>
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
            <div className="box-footer-action-link" onClick={() => navigate('/department-reports')}>
              <span>View All Requests <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} /></span>
            </div>
          </div>

          {/* Right Block: Forecast Visual Placeholder */}
          <div className="content-data-box forecast-box-width">
            <div className="box-header-title">Workforce Availability</div>
            <div className="forecast-chart-mock-body">
              <div className="chart-header-stats">
                <span>Peak: <b>95% Consistency</b></span>
                <span>Avg. Check-In: <b>07:51 AM</b></span>
              </div>
              <div className="mock-graph-graphic-line">
                <div className="wave-placeholder-line"></div>
              </div>
              <div className="chart-footer-caption" onClick={() => navigate('/workforce-forecast')}>
                <span>View Full Forecast <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} /></span>
              </div>
            </div>
          </div>

        </section>

        {/* BOTTOM SECTION Staffing Risk Banner */}
        <section className="staffing-risk-alert-banner hover-lift">
          <div className="alert-banner-inner">
            <div className="alert-icon-title">
              <Ban size={20} className="tr-icon-maroon" />
              <h4>Staffing Risk Alert</h4>
            </div>
            <p className="alert-description-text">
              Estimated availability: <span className="danger-text-percentage">58%</span> <br />
              System predicts severe staffing risk for the team during this period. Overlapping leave requests and seasonal trend analysis indicate a critical bottleneck. Immediate attention is required (Refer to Capitulo 6.2/8). Prescriptive rescheduling recommended.
            </p>
            <button className="view-report-banner-btn" onClick={() => navigate('/anomaly-alerts')}>View Report</button>
          </div>
        </section>

      </main>
    </div>
  );
}