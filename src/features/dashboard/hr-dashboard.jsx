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
  Building2 
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
    anomalies: 18 
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
    <div className="app-layout-wrapper">
      
      <HrSidebar user={user} />

      <main className="app-main-container fade-in-up" style={{ padding: '32px' }}>
        
        {/* FIX: Bulletproof inline flexbox guarantees the header won't break */}
        <header 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%', 
            marginBottom: '32px',
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box'
          }}
        >
          {/* Left Side: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', backgroundColor: '#fff5f5', color: '#7a0000', borderRadius: '8px' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                City HR Management System
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                Executive <span style={{ color: '#7a0000', fontWeight: 700 }}>Control Panel</span>
              </p>
            </div>
          </div>

          {/* Right Side: Profile & Notifications Trapped in a Flex-End container */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Header controlsOnly={true} user={user} onLogout={onLogout} onNavigate={navigate} />
          </div>
        </header>

        {/* METRICS ROW - Overview Cards */}
        <section className="hr-metrics-grid">
          
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
          <h3 className="hr-section-title" style={{ fontFamily: 'var(--font-family-heading)', fontSize: '18px', color: '#0f172a', marginBottom: '16px' }}>
            HR Management Modules
          </h3>
          
          <div className="hr-actions-grid">
            
            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/department-reports')}>
              <div className="hr-action-icon-wrapper">
                <UserCheck size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>Global Department Reports</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>Track city-wide attendance trends, department allocations, and leave histories.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/workforce-forecast')}>
              <div className="hr-action-icon-wrapper">
                <TrendingUp size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>Workforce Analytics & Forecast</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>Review predictive staffing metrics, peak check-in schedules, and coverage trends.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

            <div className="app-card hr-action-card hover-lift" onClick={() => navigate('/anomaly-alerts')}>
              <div className="hr-action-icon-wrapper alert-style">
                <ShieldAlert size={22} />
              </div>
              <div className="hr-action-details">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>Anomaly & Risk Monitor</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>Address flagged operational risks, critical bottlenecks, and schedule overlaps.</p>
              </div>
              <ChevronRight className="hr-action-arrow" size={20} />
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}