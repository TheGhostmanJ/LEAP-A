import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  Users,
  Calendar,
  AlertTriangle,
  Ban,
  ArrowRight
} from 'lucide-react';

/* =========================================================
   🛠️ IMPORT THE NEW CUSTOM HOD SIDEBAR & HEADER
   ========================================================= */
import HodSidebar from "../../components/hod-sidebar";
import Header from '../../components/Header.jsx';
import './hod-dashboard.css'; 

export default function HodDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentLeaves, setRecentLeaves] = useState([]);

  // Fetch data on component load
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

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Renders isolated HOD menu layout */}
      <HodSidebar />

      {/* Main viewport area with entrance animation */}
      <main className="dashboard-main-content fade-in-up">
        
        {/* STANDARDIZED GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting">
            Welcome, <span className="highlight-name">{user?.first_name || 'Head'}</span>!
          </div>

          {/* Shared Header Component */}
          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS TOP ROW GRID */}
        <section className="metrics-summary-row">
          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <Users size={16} className="tr-icon-maroon" />
              <span>Total Employees</span>
            </div>
            <div className="card-main-stat">250</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">● Team A <b>60</b></span>
              <span className="team-tag team-b">● Team B <b>80</b></span>
              <span className="team-tag team-c">● Team C <b>40</b></span>
              <span className="team-tag team-d">● Team D <b>30</b></span>
            </div>
          </div>

          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <Calendar size={16} className="tr-icon-amber" />
              <span>Pending Approvals</span>
            </div>
            <div className="card-main-stat">15</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">Vacation <b>8</b></span>
              <span className="badge-stat label-sick">Sick <b>5</b></span>
              <span className="badge-stat label-emergency">Emergency <b>2</b></span>
            </div>
          </div>

          <div className="metric-card-block hover-lift">
            <div className="card-title-bar">
              <AlertTriangle size={16} className="tr-icon-maroon" />
              <span>Anomaly Alerts</span>
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
              <span>View All Requests <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} /></span>
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
            <button className="view-report-banner-btn">View Report</button>
          </div>
        </section>

      </main>
    </div>
  );
}