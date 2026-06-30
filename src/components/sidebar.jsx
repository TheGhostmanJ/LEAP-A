// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, UserCheck, History, CreditCard, GraduationCap, User, HelpCircle, Clock
} from 'lucide-react';
import './sidebar.css'; // Move sidebar-specific styles here if necessary

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Keeps track of the current URL path
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

  // Helper function to dynamically add the 'active' class based on the URL
  const getMenuClass = (path) => {
    return location.pathname === path ? "sidebar-item active" : "sidebar-item";
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img src="/leaplogo.png" alt="LEAP-A Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <ul className="sidebar-menu">
        <li className={getMenuClass('/dashboard')} onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <Home size={16} /> Dashboard
        </li>
        <li className={getMenuClass('/attendance')} onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
          <UserCheck size={16} /> My Attendance
        </li>
        <li className={getMenuClass('/leavehistory')} onClick={() => navigate('/leavehistory')} style={{ cursor: 'pointer' }}>
          <History size={16} /> My Leave History
        </li>
        <li className={getMenuClass('/creditledger')} onClick={() => navigate('/creditledger')} style={{ cursor: 'pointer' }}>
          <CreditCard size={16} /> My Credit Ledger
        </li>
        <li className={getMenuClass('/trainingrecords')} onClick={() => navigate('/trainingrecords')} style={{ cursor: 'pointer' }}>
          <GraduationCap size={16} /> My Training Records
        </li>
        <li className={getMenuClass('/profile')} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <User size={16} /> My Profile
        </li>
        <li className={getMenuClass('/support')} onClick={() => navigate('/support')} style={{ cursor: 'pointer' }}>
          <HelpCircle size={16} /> Support
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