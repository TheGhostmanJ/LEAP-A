import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, ChevronDown, LogOut } from 'lucide-react';
import './header.css';

export default function Header({ user, onLogout, title }) {
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
        return `${first || ''} ${last || ''}`.trim() || 'Employee Name';
    };

    // Shared right-hand control action items
    const renderControls = () => (
        <div className="header-user-controls">
            <button className="header-icon-btn" aria-label="Notifications">
                <Bell size={18} />
                <span className="notification-badge-dot" />
            </button>

            <div className="header-profile-dropdown" ref={dropdownRef}>
                <button 
                    className={`profile-pill-trigger ${isDropdownOpen ? 'active' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <div className="profile-avatar-sm">
                        <User size={14} />
                    </div>
                    <span className="profile-name-text">
                        {formatFullName(user?.first_name, user?.last_name)}
                    </span>
                    <ChevronDown size={14} className={`dropdown-chevron ${isDropdownOpen ? 'rotated' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="profile-menu-overlay">
                        <div className="menu-user-details">
                            <span className="menu-user-name">{formatFullName(user?.first_name, user?.last_name)}</span>
                            <span className="menu-user-role">{user?.role || 'Employee'}</span>
                        </div>
                        <hr className="menu-divider" />
                        <button onClick={onLogout} className="menu-item logout-item">
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
                    <h2>{title}</h2>
                </div>
                {renderControls()}
            </header>
        );
    }

    // Otherwise, render strictly as inline control actions for nesting inside existing page headers
    return renderControls();
}