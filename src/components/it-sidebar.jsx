import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Server, Shield, Database, Terminal, User, Clock, Settings,
  ChevronLeft, ChevronRight, Menu, X, Home, UserCheck, History, CreditCard, GraduationCap,
  KeyRound
} from 'lucide-react';
import './sidebar.css'; 

export default function ItSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

  // 🔴 UPGRADED: useLayoutEffect fires synchronously BEFORE the screen paints!
  useLayoutEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('itSidebarScroll');
    
    if (sidebarRef.current && savedScrollPosition) {
      // 1. Try setting it immediately before paint
      sidebarRef.current.scrollTop = parseInt(savedScrollPosition, 10);
      
      // 2. Fallback for slower DOM rendering
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = parseInt(savedScrollPosition, 10);
        }
      }, 50);
    }
  }, [location.pathname]); 

  // 🔴 DEBUGGING ADDED: This will print the scroll number in your browser console
  const handleScroll = (e) => {
    const currentScroll = e.target.scrollTop;
    console.log("IT Sidebar is scrolling at position:", currentScroll); 
    sessionStorage.setItem('itSidebarScroll', currentScroll);
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

  const itOperationsItems = [
    { path: '/system-config', icon: Server, label: 'System Config' },
    { path: '/role-management', icon: Shield, label: 'Role Management (RBAC)' },
    { path: '/database-metrics', icon: Database, label: 'Database Metrics' },
    { path: '/api-gateway', icon: Terminal, label: 'API Gateway Log' },
    { path: '/password-reset-requests', icon: KeyRound, label: 'Password Reset Requests' },
    { path: '/system-settings', icon: Settings, label: 'Global Settings' },
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
      {isMobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <button
        className="mobile-floating-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside 
        className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
        ref={sidebarRef}
        onScroll={handleScroll}
      >
        <div className="sidebar-brand">
          {!isCollapsed ? (
            <img src="/leaplogo.png" alt="LEAP-A Logo" className="sidebar-logo-img" />
          ) : (
            <img src="/leap-asidebar.png" alt="LEAP-A" className="sidebar-logo-icon" />
          )}
        </div>

        <div className="sidebar-section-label">
          {!isCollapsed && "IT Operations"}
        </div>
        <ul className="sidebar-menu">
          {itOperationsItems.map((item) => (
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

        <div className="sidebar-section-label">
          {!isCollapsed && "Account"}
        </div>
        <ul className="sidebar-menu">
          {accountMenuItems.map((item) => (
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