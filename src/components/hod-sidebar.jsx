// src/components/hod-sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, CheckSquare, BarChart3, AlertTriangle, FileText, User, Clock
} from 'lucide-react';
import './sidebar.css'; // Reuses their exact same sidebar styling layout!

export default function HodSidebar() {
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

      {/* 🌟 HOD EXCLUSIVE SIDEBAR MENU */}
      <ul className="sidebar-menu">
        <li className={getMenuClass('/hod-dashboard')} onClick={() => navigate('/hod-dashboard')} style={{ cursor: 'pointer' }}>
          <Home size={16} /> Dashboard
        </li>
        <li className={getMenuClass('/leave-approvals')} onClick={() => navigate('/leave-approvals')} style={{ cursor: 'pointer' }}>
          <CheckSquare size={16} /> Leave Approvals
        </li>
        <li className={getMenuClass('/workforce-forecast')} onClick={() => navigate('/workforce-forecast')} style={{ cursor: 'pointer' }}>
          <BarChart3 size={16} /> Workforce Forecast
        </li>
        <li className={getMenuClass('/anomaly-alerts')} onClick={() => navigate('/anomaly-alerts')} style={{ cursor: 'pointer' }}>
          <AlertTriangle size={16} /> Anomaly Alerts
        </li>
        <li className={getMenuClass('/department-reports')} onClick={() => navigate('/department-reports')} style={{ cursor: 'pointer' }}>
          <FileText size={16} /> Department Reports
        </li>
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