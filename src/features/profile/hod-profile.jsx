import React from 'react';
import HodSidebar from '../../components/hod-sidebar';
import { Bell, User, TriangleAlert } from 'lucide-react';
import './hod-profile.css'; // We will create this dedicated CSS next!

export default function HodProfile({ onLogout, user }) {
  return (
    <div className="dashboard-container hod-view-wrapper">
      {/* Persistent Left Navigation Column */}
      <HodSidebar />

      {/* Main Viewport Content Surface */}
      <div className="dashboard-main-content">
        
        {/* UNIFORM GLOBAL HEADER */}
        <header className="dashboard-global-header">
          <div className="welcome-greeting page-title-layout">
            <User size={22} className="title-icon-svg" /> 
            <div className="title-text-group">
              <h2>My Profile</h2>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-bell-btn">
              <Bell size={18} fill="#ffffff" color="#ffffff" />
              <span className="bell-badge"></span>
            </button>
            
            <div className="user-profile-badge">
              <span className="profile-icon-avatar">👤</span>
              <span className="profile-name-string">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HOD Name'}</span>
            </div>
            
            <button className="logout-action-btn" onClick={onLogout}>Log Out</button>
          </div>
        </header>

        {/* 👤 MAIN USER CARD SURFACE matching image_91eb4c.png */}
        <div className="profile-outer-card card-shadow-wrap">
          
          {/* Top Identity Block */}
          <div className="profile-identity-hero-row">
            <div className="profile-large-avatar-circle">
              <div className="avatar-inner-graphic">
                <div className="avatar-head"></div>
                <div className="avatar-body"></div>
              </div>
            </div>
            <div className="profile-hero-text">
              <h1>{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'HOD Name'}</h1>
              <h3>Head</h3>
              <p>{user?.department || 'City Budget Office'}</p>
            </div>
          </div>

          <hr className="profile-divider-line" />

          {/* Center Metadata Columns Grid */}
          <div className="profile-metadata-columns-grid">
            <div className="metadata-column-section">
              <h4>Personal Information</h4>
              <ul className="metadata-fields-list">
                <li><span className="field-label">Employee ID:</span> <span className="field-value">{user?.employee_id || 'N/A'}</span></li>
                <li><span className="field-label">Full Name:</span> <span className="field-value">{`${user?.first_name || ''} ${user?.middle_name || ''} ${user?.last_name || ''}`.trim()}</span></li>
                <li><span className="field-label">Date of Birth:</span> <span className="field-value">{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</span></li>
                <li><span className="field-label">Gender:</span> <span className="field-value">{user?.gender || 'N/A'}</span></li>
                <li><span className="field-label">Civil Status:</span> <span className="field-value">{user?.civil_status || 'N/A'}</span></li>
                <li><span className="field-label">Contact No.:</span> <span className="field-value">{user?.contact_number || 'N/A'}</span></li>
                <li><span className="field-label">Email:</span> <span className="field-value">{user?.email || 'N/A'}</span></li>
              </ul>
            </div>

            <div className="metadata-column-section">
              <h4>Employment Information</h4>
              <ul className="metadata-fields-list">
                <li><span className="field-label">Position:</span> <span className="field-value">{user?.position_title || 'N/A'}</span></li>
                <li><span className="field-label">Department:</span> <span className="field-value">{user?.department || 'N/A'}</span></li>
                <li><span className="field-label">Salary Grade:</span> <span className="field-value">{user?.salary_grade || 'N/A'}</span></li>
                <li><span className="field-label">Employment Type:</span> <span className="field-value">{user?.employment_type || 'N/A'}</span></li>
                <li><span className="field-label">Date Hired:</span> <span className="field-value">{user?.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'N/A'}</span></li>
                <li><span className="field-label">Years of Service:</span> <span className="field-value">{user?.years_of_service || '0'} Years</span></li>
              </ul>
            </div>
          </div>

          <hr className="profile-divider-line" />

          {/* Account Security Base Section */}
          <div className="profile-security-section-box">
            <h4>Account Security</h4>
            <p><strong>Account Username:</strong> <span className="security-light-text">{user?.username || 'mariosantos'}</span></p>
            <p><strong>System Access Level:</strong> <span className="security-light-text">Head of the Department Access Portal</span></p>
          </div>

          {/* Bottom Accent Maroon Strip */}
          <div className="profile-card-maroon-accent-footer"></div>
        </div>

        {/* ⚠️ ADVISORY DISCLAIMER FOOTER NOTE */}
        <div className="profile-advisory-disclaimer-note">
          <TriangleAlert size={16} className="disclaimer-alert-icon" />
          <span>Personal and employment information is managed by the City Personnel Office. Contact HR for any corrections or updates.</span>
        </div>

      </div>
    </div>
  );
}