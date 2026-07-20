// src/components/it-sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Server, Shield, Database, Terminal, User, Clock, Settings
} from 'lucide-react';
import './sidebar.css'; 

export default function ItSidebar() {
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
        <div className="sidebar-section-label">IT Operations</div>
        
        <li className={getMenuClass('/system-config')} onClick={() => navigate('/system-config')}>
          <Server size={16} /> System Config
        </li>
        <li className={getMenuClass('/role-management')} onClick={() => navigate('/role-management')}>
          <Shield size={16} /> Role Management (RBAC)
        </li>
        <li className={getMenuClass('/database-metrics')} onClick={() => navigate('/database-metrics')}>
          <Database size={16} /> Database Metrics
        </li>
        <li className={getMenuClass('/api-gateway')} onClick={() => navigate('/api-gateway')}>
          <Terminal size={16} /> API Gateway Log
        </li>
        <li className={getMenuClass('/system-settings')} onClick={() => navigate('/system-settings')}>
          <Settings size={16} /> Global Settings
        </li>

        <div className="sidebar-section-label">Account</div>
        
        <li className={getMenuClass('/it-profile')} onClick={() => navigate('/it-profile')}>
          <User size={16} /> My IT Profile
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