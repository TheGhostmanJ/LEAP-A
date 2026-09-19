import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Building2 // Added for the new header layout icon
} from 'lucide-react';

/* COMPONENTS & STYLES */
import HrSidebar from '../../components/hr-sidebar.jsx';
import Header from '../../components/Header.jsx';
import './hr-dashboard.css';

export default function HrDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  
  // State to hold dynamic database metrics
  const [stats, setStats] = useState({
    totalWorkforce: 0,
    activeEmployees: 0,
    onLeave: 0,
    pendingEdits: 0,
    anomalies: 18 // Static placeholder until the anomaly engine is integrated here
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/hr/dashboard-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch HR dashboard stats", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    // UI FIX: Using the global app-layout-wrapper
    <div className="app-layout-wrapper">
      
      {/* Navigation Column */}
      <HrSidebar user={user} />

      {/* Main Viewport Area */}
      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* UNIFIED GLOBAL HEADER ROW */}
        <header className="app-global-header">
          <div className="app-title-layout">
            <div className="app-title-icon-badge">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="app-title">City HR Management System</h1>
              <p className="app-subtitle">
                Executive <span className="app-subtitle-accent">Control Panel</span>
              </p>
            </div>
          </div>

          {/* UI FIX: Added controlsOnly to prevent layout breaking */}
          <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
        </header>

        {/* METRICS ROW - Overview Cards */}
        <section className="hr-metrics-grid">
          
          {/* Card 1: Total City Workforce */}
          <div className="app-card hr-metric-card hover-lift" onClick={() => navigate('/department-reports')}>
            <div className="hr-card-label-row">
              <Users size={18} className="hr-icon-maroon" />
              <span>Total City Workforce</span>
            </div>
            <div className="hr-metric-stat">{stats.totalWorkforce.toLocaleString()}</div>
            <div className="hr-card-subtext">
              <span className="hr-tag hr-tag-success">● Active <b>{stats.activeEmployees.toLocaleString()}</b></span>
              <span className="hr-tag hr-tag-neutral">● On Leave <b>{stats.onLeave.toLocaleString()}</b></span>
            </div>
          </div>

          {/* Card 2: Pending Profile Edits */}
          <div className="app-card hr-metric-card hover-lift" onClick={() => navigate('/profile-requests')}>
            <div className="hr-card-label-row">
              <FileCheck size={18} className="hr-icon-amber" />
              <span>Pending Profile Edits</span>
            </div>
            <div className="hr-metric-stat">{stats.pendingEdits}</div>
            <div className="hr-card-subtext">
              <span className="hr-pill-info">Awaiting HR Review</span>
            </div>
          </div>

          {/* Card 3: Master Anomaly Alerts */}
          <div className="app-card hr-metric-card hover-lift" onClick={() => navigate('/anomaly-alerts')}>
            <div className="hr-card-label-row">
              <AlertTriangle size={18} className="hr-icon-maroon" />
              <span>Master Anomaly Alerts</span>
            </div>
            <div className="hr-metric-stat hr-text-alert">{stats.anomalies}</div>
            <div className="hr-card-subtext">
              <span className="hr-risk-pill high">5 High</span>
              <span className="hr-risk-pill med">8 Med</span>
              <span className="hr-risk-pill low">5 Low</span>
            </div>
          </div>

        </section>

        {/* QUICK NAVIGATION HUB */}
        <section className="hr-quick-actions-section" style={{ marginTop: '32px' }}>
          <h3 className="hr-section-title" style={{ fontFamily: 'var(--font-family-heading)', fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            HR Management Modules
          </h3>
          
          <div className="hr-actions-grid">
            
            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/department-reports')}>
              <div className="hr-action-icon-wrapper">
                <UserCheck size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text-primary)' }}>Global Department Reports</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Track city-wide attendance trends, department allocations, and leave histories.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/workforce-forecast')}>
              <div className="hr-action-icon-wrapper">
                <TrendingUp size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text-primary)' }}>Workforce Analytics & Forecast</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Review predictive staffing metrics, peak check-in schedules, and coverage trends.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/anomaly-alerts')}>
              <div className="hr-action-icon-wrapper alert-style">
                <ShieldAlert size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text-primary)' }}>Anomaly & Risk Monitor</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Address flagged operational risks, critical bottlenecks, and schedule overlaps.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}