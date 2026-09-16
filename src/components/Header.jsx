// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import NotificationBell from './NotificationBell.jsx';
import './Header.css';

export default function Header({ user, onLogout, title, subtitle, onNavigate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const renderStyledTitle = (rawTitle) => {
    if (!rawTitle) return null;
    const words = rawTitle.split(' ');
    if (words.length <= 1) return rawTitle;

    const mainText = words.slice(0, -1).join(' ');
    const lastWord = words[words.length - 1];

    return (
      <>
        {mainText} <span className="title-accent-glow">{lastWord}</span>
      </>
    );
  };

  const renderControls = () => (
    <div className="header-user-controls">
      {/* Dynamic Notification Bell Component */}
      <NotificationBell 
        employeeKey={user?.employee_key || ''} 
        onNavigate={onNavigate} 
      />

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
  );

  // If a title prop is passed, render a self-contained top header row
  if (title) {
    return (
      <header className="app-top-header">
        <div className="header-page-title">
          <div className="header-portal-tag">
            <ShieldCheck size={13} className="portal-tag-icon" />
            <span>{user?.role ? `${user.role.toUpperCase()} PORTAL` : 'LEAP-A SYSTEM'}</span>
          </div>
          <h2>{renderStyledTitle(title)}</h2>
          {subtitle ? (
            <p className="header-subtitle">{subtitle}</p>
          ) : (
            <p className="header-subtitle">
              <Sparkles size={12} className="subtitle-sparkle-icon" />
              <span>Real-time operational portal & analytics engine</span>
            </p>
          )}
        </div>
        {renderControls()}
      </header>
    );
  }

  // Otherwise, render strictly as inline control actions for nesting inside existing page headers
  return renderControls();
}