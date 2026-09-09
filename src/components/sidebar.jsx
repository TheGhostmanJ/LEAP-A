// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, UserCheck, History, CreditCard, GraduationCap, User, HelpCircle, Clock,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import './sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Mobile slide-out state
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

  // Close mobile menu automatically when navigating
  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false); 
  };

  const mainMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/attendance', icon: UserCheck, label: 'My Attendance' },
    { path: '/leavehistory', icon: History, label: 'My Leave History' },
    { path: '/creditledger', icon: CreditCard, label: 'My Credit Ledger' },
    { path: '/trainingrecords', icon: GraduationCap, label: 'My Training Records' },
  ];

  const generalMenuItems = [
    { path: '/profile', icon: User, label: 'My Profile' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
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
      {/* MOBILE OVERLAY: Darkens the screen behind the sidebar and closes it if tapped */}
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

      {/* SIDEBAR COMPONENT */}
      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        
        {/* BRAND / LOGO AREA */}
        <div className="sidebar-brand">
          {!isCollapsed ? (
            <img src="/leaplogo.png" alt="LEAP-A Logo" className="sidebar-logo-img" />
          ) : (
            <img src="/leap-asidebar.png" alt="LEAP-A" className="sidebar-logo-icon" />
          )}
        </div>

        {/* MAIN NAVIGATION SECTION */}
        {!isCollapsed && <div className="sidebar-section-label">Main Menu</div>}
        <ul className="sidebar-menu">
          {mainMenuItems.map((item) => (
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

        {/* GENERAL SECTION */}
        {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Account & Support</div>}
        <ul className="sidebar-menu">
          {generalMenuItems.map((item) => (
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
                <span className="time-label">Time: <span className="time-value">{formattedTime}</span></span>
              </div>
            )}
          </div>

          {/* BOTTOM TOGGLE BUTTON (Desktop Only) */}
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

        {/* FLOATING TOOLTIP (Desktop Only) */}
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