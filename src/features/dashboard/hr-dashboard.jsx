import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  Home, UserCheck, History, CreditCard, GraduationCap,
  User, HelpCircle, Clock, Bell, Search, FilePlus, ExternalLink
} from 'lucide-react';
import HrSidebar from '../../components/hr-sidebar.jsx';
import './hod-dashboard.css'; // Reusing the exact same CSS layout

export default function HrDashboard({ onLogout, user }) {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recentLeaves, setRecentLeaves] = useState([]);

    // Fetch data on component load
      useEffect(() => {
        const fetchRecentLeaves = async () => {
          try {
            const response = await fetch(`http://localhost:3001/api/leave/recent/${user.employee_key}`);
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
    
      const formattedDate = currentTime.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    
      const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });

  return (
    <div className="dashboard-container hod-view-wrapper">
      <HrSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-global-header">
          <div className="welcome-greeting">
            Welcome, <span className="highlight-name">{user?.first_name || 'HR Admin'}</span>!
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
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

        {/* METRICS ROW - City-Wide Scope */}
        <section className="metrics-summary-row">
          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>👥 Total City Workforce</span>
            </div>
            <div className="card-main-stat">1,450</div>
            <div className="team-distribution-subtext">
              <span className="team-tag team-a">● Active <b>1,410</b></span>
              <span className="team-tag team-b">● On Leave <b>40</b></span>
            </div>
          </div>

          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>📝 Pending Profile Edits</span>
            </div>
            <div className="card-main-stat">12</div>
            <div className="approval-breakdown-subtext">
              <span className="badge-stat label-vacation">Civil Status <b>5</b></span>
              <span className="badge-stat label-sick">Contact Info <b>7</b></span>
            </div>
          </div>

          <div className="metric-card-block">
            <div className="card-title-bar">
              <span>⚠️ Master Anomaly Alerts</span>
            </div>
            <div className="card-main-stat text-alert-red">18</div>
            <div className="anomaly-breakdown-pills">
              <span className="pill risk-high">5 High</span>
              <span className="pill risk-medium">8 Med</span>
              <span className="pill risk-low">5 Low</span>
            </div>
          </div>
        </section>

        {/* You can copy the rest of the bottom layout directly from hod-dashboard.jsx */}
      </div>
    </div>
  );
}