// src/components/hr-sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, CheckSquare, BarChart3, AlertTriangle, FileText, 
  User, Clock, Users, Building2, Banknote
} from 'lucide-react';
import './sidebar.css'; 

export default function HrSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const getMenuClass = (path) => {
    return location.pathname === path ? "sidebar-item active" : "sidebar-item";
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img src="/leaplogo.png" alt="LEAP-A Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <ul className="sidebar-menu">
        <div className="sidebar-section-label">Management Analytics</div>
        
        <li className={getMenuClass('/hr-dashboard')} onClick={() => navigate('/hr-dashboard')}>
            <Home size={16} /> Global Dashboard
        </li>
        <li className={getMenuClass('/workforce-forecast')} onClick={() => navigate('/workforce-forecast')}>
          <BarChart3 size={16} /> Workforce Forecast
        </li>
        <li className={getMenuClass('/anomaly-alerts')} onClick={() => navigate('/anomaly-alerts')}>
          <AlertTriangle size={16} /> Anomaly Alerts
        </li>
        <li className={getMenuClass('/department-reports')} onClick={() => navigate('/department-reports')}>
          <FileText size={16} /> Global Reports
        </li>

        <div className="sidebar-section-label">HR Operations</div>
        
        <li className={getMenuClass('/onboarding')} onClick={() => navigate('/onboarding')}>
          <Users size={16} /> Employee Onboarding
        </li>
        <li className={getMenuClass('/departments')} onClick={() => navigate('/departments')}>
          <Building2 size={16} /> Department Setup
        </li>
        <li className={getMenuClass('/payroll')} onClick={() => navigate('/payroll')}>
          <Banknote size={16} /> Payroll & Ledger
        </li>
        <li className={getMenuClass('/profile-requests')} onClick={() => navigate('/profile-requests')}>
            <User size={16} /> Profile Edit Requests
        </li>
        
        <div className="sidebar-section-label">Account</div>

        <li className={getMenuClass('/profile')} onClick={() => navigate('/profile')}>
            <User size={16} /> My Profile
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="datetime-box">
          <Clock size={20} />
          <div className="datetime-text">
            <span>{formattedDate}</span>
            <span className="time-label">Time: <span style={{ color: '#5a0000' }}>{formattedTime}</span></span>
          </div>
        </div>
      </div>
    </aside>
  );
}