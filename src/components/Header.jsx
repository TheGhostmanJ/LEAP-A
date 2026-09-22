import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Clock, User, HelpCircle, FileText, 
  Wallet, Award, FilePlus, Users, CalendarCheck, 
  TrendingUp, AlertTriangle, BarChart3, Building2, 
  Calendar, DollarSign, UserCheck, Settings, Shield, 
  Database, Cpu, Key, Sliders, ChevronDown, LogOut,
  Briefcase
} from 'lucide-react';
import NotificationBell from './NotificationBell.jsx';
import './Header.css';

// Configured metadata per route with custom icons & visual themes
const ROUTE_CONFIG = {
  '/dashboard': { title: 'Employee Dashboard', icon: LayoutDashboard, tag: 'Overview', color: '#7a1220', bg: '#fcf2f4' },
  '/attendance': { title: 'My Attendance Log', icon: Clock, tag: 'Time Tracker', color: '#2563eb', bg: '#eff6ff' },
  '/profile': { title: 'Profile Management', icon: User, tag: 'Account', color: '#0d9488', bg: '#f0fdfa' },
  '/support': { title: 'Support Center', icon: HelpCircle, tag: 'Helpdesk', color: '#4f46e5', bg: '#eef2ff' },
  '/leavehistory': { title: 'Leave History', icon: FileText, tag: 'Records', color: '#d97706', bg: '#fffbeb' },
  '/creditledger': { title: 'Credit Ledger', icon: Wallet, tag: 'Balances', color: '#059669', bg: '#ecfdf5' },
  '/trainingrecords': { title: 'Training Records', icon: Award, tag: 'Learning', color: '#9333ea', bg: '#faf5ff' },
  '/leaveapplication': { title: 'File Leave Application', icon: FilePlus, tag: 'Requests', color: '#e11d48', bg: '#fff1f2' },
  '/hod-dashboard': { title: 'HOD Dashboard', icon: Users, tag: 'Management', color: '#0284c7', bg: '#f0f9ff' },
  '/leave-approvals': { title: 'Leave Approvals', icon: CalendarCheck, tag: 'Workflow', color: '#16a34a', bg: '#f0fdf4' },
  '/workforce-forecast': { title: 'Workforce Forecast', icon: TrendingUp, tag: 'Analytics', color: '#2563eb', bg: '#eff6ff' },
  '/anomaly-alerts': { title: 'Anomaly Alerts', icon: AlertTriangle, tag: 'Security', color: '#dc2626', bg: '#fef2f2' },
  '/department-reports': { title: 'Department Reports', icon: BarChart3, tag: 'Insights', color: '#7c3aed', bg: '#f5f3ff' },
  '/hr-dashboard': { title: 'HR Dashboard', icon: Building2, tag: 'HR Portal', color: '#c026d3', bg: '#fdf4ff' },
  '/event-management': { title: 'Event Management', icon: Calendar, tag: 'Schedule', color: '#ea580c', bg: '#fff7ed' },
  '/departments': { title: 'Department Setup', icon: Building2, tag: 'Structure', color: '#0891b2', bg: '#ecfeff' },
  '/hiring': { title: 'Hiring & Succession', icon: Briefcase, tag: 'Recruitment', color: '#be123c', bg: '#fff1f2' },
  '/payroll': { title: 'Payroll & Ledger', icon: DollarSign, tag: 'Finance', color: '#15803d', bg: '#f0fdf4' },
  '/profile-requests': { title: 'Profile Management Requests', icon: UserCheck, tag: 'Approvals', color: '#0284c7', bg: '#f0f9ff' },
  '/system-config': { title: 'System Configuration', icon: Settings, tag: 'Admin', color: '#4b5563', bg: '#f9fafb' },
  '/role-management': { title: 'Role Management', icon: Shield, tag: 'Permissions', color: '#b91c1c', bg: '#fef2f2' },
  '/database-metrics': { title: 'Database Metrics', icon: Database, tag: 'Infrastructure', color: '#2563eb', bg: '#eff6ff' },
  '/api-gateway': { title: 'API Gateway', icon: Cpu, tag: 'Developer', color: '#9333ea', bg: '#faf5ff' },
  '/password-reset-requests': { title: 'Password Reset Requests', icon: Key, tag: 'Security', color: '#d97706', bg: '#fffbeb' },
  '/system-settings': { title: 'System Settings', icon: Sliders, tag: 'Preferences', color: '#374151', bg: '#f3f4f6' },
};

export default function Header({ user, onLogout, onNavigate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Get active route configuration or fallback
  const activeRoute = ROUTE_CONFIG[location.pathname] || {
    title: 'Dashboard',
    icon: LayoutDashboard,
    tag: 'Portal',
    color: '#7a1220',
    bg: '#fcf2f4',
  };

  const PageIcon = activeRoute.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatFullName = (first, last) => {
    if (!first && !last) return 'Employee Name';
    return `${first || ''} ${last || ''}`.trim();
  };

  return (
    <header className="global-page-header">
      <div className="header-left-title">
        <div 
          className="header-icon-badge" 
          style={{ backgroundColor: activeRoute.bg, borderColor: `${activeRoute.color}25` }}
        >
          <PageIcon size={18} style={{ color: activeRoute.color }} />
        </div>
        <div className="header-title-text-group">
          <div className="header-title-row">
            <h1 className="header-page-title">{activeRoute.title}</h1>
            <span 
              className="header-route-tag" 
              style={{ color: activeRoute.color, backgroundColor: activeRoute.bg }}
            >
              {activeRoute.tag}
            </span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="header-user-controls">
        {/* Directly navigates to /support on click */}
        <Link 
          to="/support" 
          className="header-utility-btn" 
          title="Support Center"
        >
          <HelpCircle size={18} />
        </Link>

        {NotificationBell ? (
          <NotificationBell
            employeeKey={user?.employee_key || ''}
            onNavigate={onNavigate}
          />
        ) : null}

        <div className="header-divider-vertical"></div>

        {/* User Pill */}
        <div className="header-profile-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className={`profile-pill-trigger ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-avatar-sm">
              <User size={15} />
            </div>
            <div className="profile-info-stack">
              <span className="profile-name-text">
                {formatFullName(user?.first_name, user?.last_name)}
              </span>
              <span className="profile-role-subtext">{user?.role || 'Employee'}</span>
            </div>
            <ChevronDown size={14} className={`dropdown-chevron ${isDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="profile-menu-overlay">
              <div className="menu-user-details">
                <span className="menu-user-name">{formatFullName(user?.first_name, user?.last_name)}</span>
                <span className="menu-user-email">{user?.email || user?.employee_key || 'Active Account'}</span>
              </div>
              <hr className="menu-divider" />
              <button type="button" onClick={onLogout} className="menu-item logout-item">
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
