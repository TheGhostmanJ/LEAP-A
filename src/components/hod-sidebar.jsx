import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, CheckSquare, BarChart3, AlertTriangle, FileText,
  User, Clock, ChevronLeft, ChevronRight, Menu, X,
  UserCheck, History, CreditCard, GraduationCap
} from 'lucide-react';
import './sidebar.css';

export default function HodSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 1. Create a reference to the scrollable sidebar container
  const sidebarRef = useRef(null);

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

  // 2. Restore scroll position on load
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('hodSidebarScroll');
    if (sidebarRef.current && savedScrollPosition) {
      sidebarRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }
  }, []);

  // 3. Save scroll position exactly as the user scrolls
  const handleScroll = (e) => {
    sessionStorage.setItem('hodSidebarScroll', e.target.scrollTop);
  };

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

  const mainMenuItems = [
    { path: '/hod-dashboard', icon: Home, label: 'Department Dashboard' },
    { path: '/leave-approvals', icon: CheckSquare, label: 'Leave Approvals' },
    { path: '/workforce-forecast', icon: BarChart3, label: 'Workforce Forecast' },
    { path: '/anomaly-alerts', icon: AlertTriangle, label: 'Anomaly Alerts' },
    { path: '/department-reports', icon: FileText, label: 'Department Reports' },
  ];

  const employeeMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Personal Dashboard' },
    { path: '/attendance', icon: UserCheck, label: 'My Attendance' },
    { path: '/leavehistory', icon: History, label: 'My Leave History' },
    { path: '/creditledger', icon: CreditCard, label: 'My Credit Ledger' },
    { path: '/trainingrecords', icon: GraduationCap, label: 'My Training Records' },
  ];

  const generalMenuItems = [
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

      {/* ATTACHED REF AND ONSCROLL HANDLER HERE */}
      <aside 
        className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
        ref={sidebarRef}
        onScroll={handleScroll}
      >
        {/* BRAND / LOGO AREA */}
        <div className="sidebar-brand">
          {!isCollapsed ? (
            <img src="/leaplogo.png" alt="LEAP-A Logo" className="sidebar-logo-img" />
          ) : (
            <img src="/leap-asidebar.png" alt="LEAP-A" className="sidebar-logo-icon" />
          )}
        </div>

        {/* MAIN NAVIGATION SECTION */}
        <div className="sidebar-section-label">
          {!isCollapsed && "HOD Menu"}
        </div>
        <ul className="sidebar-menu">
          {mainMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={20} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* PERSONAL EMPLOYEE RECORDS SECTION */}
        <div className="sidebar-section-label">
          {!isCollapsed && "My Employee Records"}
        </div>
        <ul className="sidebar-menu">
          {employeeMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={20} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* GENERAL SECTION */}
        <div className="sidebar-section-label">
          {!isCollapsed && "Account"}
        </div>
        <ul className="sidebar-menu">
          {generalMenuItems.map((item) => (
            <li
              key={item.path}
              className={getMenuClass(item.path)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <item.icon size={20} className="sidebar-item-icon" />
              {!isCollapsed && <span className="sidebar-item-label">{item.label}</span>}
            </li>
          ))}
        </ul>

        {/* FOOTER AREA */}
        <div className="sidebar-footer">
          <div className="datetime-box">
            <Clock size={20} className="datetime-icon" />
            {!isCollapsed && (
              <div className="datetime-text">
                <span>{formattedDate}</span>
                <span className="time-label">Time: <span className="time-value">{formattedTime}</span></span>
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