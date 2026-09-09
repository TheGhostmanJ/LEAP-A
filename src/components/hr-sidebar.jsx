// src/components/hr-sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BarChart3, AlertTriangle, FileText, 
  User, Clock, Users, Building2, Banknote,
  ChevronLeft, ChevronRight, ClipboardList, Menu, X,
  UserCheck, History, CreditCard, GraduationCap
} from 'lucide-react';
import './sidebar.css'; 

export default function HrSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

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

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false); 
  };

  const analyticsMenuItems = [
    { path: '/hr-dashboard', icon: Home, label: 'Global Dashboard' },
    { path: '/workforce-forecast', icon: BarChart3, label: 'Workforce Forecast' },
    { path: '/anomaly-alerts', icon: AlertTriangle, label: 'Anomaly Alerts' },
    { path: '/department-reports', icon: FileText, label: 'Global Reports' },
  ];

  const operationsMenuItems = [
    { path: '/onboarding', icon: ClipboardList, label: 'Employee Onboarding' },
    { path: '/departments', icon: Building2, label: 'Department Setup' },
    { path: '/payroll', icon: Banknote, label: 'Payroll & Ledger' },
    { path: '/profile-requests', icon: Users, label: 'Profile Management' },
  ];

  const employeeMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Personal Dashboard' },
    { path: '/attendance', icon: UserCheck, label: 'My Attendance' },
    { path: '/leavehistory', icon: History, label: 'My Leave History' },
    { path: '/creditledger', icon: CreditCard, label: 'My Credit Ledger' },
    { path: '/trainingrecords', icon: GraduationCap, label: 'My Training Records' },
  ];

  const accountMenuItems = [
    { path: '/profile', icon: User, label: 'My Profile' },
  ];

  const handleMouseEnter = (e, label) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 12
    });
    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* MOBILE FLOATING TOGGLE BUTTON */}
      <button
        className="mobile-floating-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* BRAND / LOGO AREA */}
        <div className="sidebar-brand">
          {!isCollapsed ? (
            <img src="/leaplogo.png" alt="LEAP-A Logo" className="sidebar-logo-img" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
          ) : (
            <img src="/leap-asidebar.png" alt="LEAP-A" className="sidebar-logo-icon" />
          )}
        </div>

        {/* MANAGEMENT ANALYTICS SECTION */}
        {!isCollapsed && <div className="sidebar-section-label">Management Analytics</div>}
        <ul className="sidebar-menu">
          {analyticsMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={18} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* HR OPERATIONS SECTION */}
        {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: '16px' }}>HR Operations</div>}
        <ul className="sidebar-menu">
          {operationsMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={18} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* PERSONAL EMPLOYEE RECORDS SECTION */}
        {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: '16px' }}>My Employee Records</div>}
        <ul className="sidebar-menu">
          {employeeMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={18} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* ACCOUNT SECTION */}
        {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Account</div>}
        <ul className="sidebar-menu">
          {accountMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={18} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* FOOTER AREA */}
        <div className="sidebar-footer">
          <div className="datetime-box">
            <Clock size={18} className="datetime-icon" />
            {!isCollapsed && (
              <div className="datetime-text">
                <span>{formattedDate}</span>
                <span className="time-label">Time: <span className="time-value" style={{ color: '#5a0000' }}>{formattedTime}</span></span>
              </div>
            )}
          </div>

          {/* BOTTOM TOGGLE BUTTON */}
          <button
            type="button"
            className="sidebar-bottom-toggle-btn desktop-toggle-only"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span>Collapse menu</span>}
          </button>
        </div>

        {/* FLOATING TOOLTIP */}
        {hoveredItem && (
          <div
            className="sidebar-floating-tooltip"
            style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
          >
            {hoveredItem}
          </div>
        )}
      </aside>
    </>
  );
}