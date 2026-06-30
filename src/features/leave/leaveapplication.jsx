// src/LeaveApplication.jsx
import React, { useState, useEffect } from 'react';
import {
  Home,
  UserCheck,
  History,
  CreditCard,
  GraduationCap,
  User,
  HelpCircle,
  Clock,
  Bell,
  Calendar
} from 'lucide-react';
import './LeaveApplication.css';

export default function LeaveApplication({ onNavigate, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commutation, setCommutation] = useState('not-requested');
  const [leaveType, setLeaveType] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit logic — wire to backend/API later
    alert('Leave application submitted!');
    onNavigate('dashboard');
  };

  const handleCancel = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="dashboard-container">

      {/* SIDEBAR NAVIGATION — identical structure to Dashboard.jsx for consistency */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/leaplogo.png" alt="LEAP-A Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => onNavigate('dashboard')}>
            <Home size={16} /> Dashboard
          </li>
          <li className="sidebar-item" onClick={() => onNavigate('attendance')}>
            <UserCheck size={16} /> My Attendance
          </li>
          <li className="sidebar-item active" onClick={() => onNavigate('leaveHistory')}>
            <History size={16} /> My Leave History
          </li>
          <li className="sidebar-item" onClick={() => onNavigate('creditLedger')}>
            <CreditCard size={16} /> My Credit Ledger
          </li>
          <li className="sidebar-item" onClick={() => onNavigate('training')}>
            <GraduationCap size={16} /> My Training Records
          </li>
          <li className="sidebar-item" onClick={() => onNavigate('profile')}>
            <User size={16} /> My Profile
          </li>
          <li className="sidebar-item" onClick={() => onNavigate('support')}>
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

      {/* MAIN CONTENT */}
      <main className="dashboard-main-content">

        {/* TOP HEADER — matches dashboard's header pattern */}
        <header className="content-top-header">
          <div></div>

          <div className="user-controls-cluster">
            <button className="icon-alert-btn">
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>

            <div className="profile-identity-card">
              <div className="avatar-placeholder">
                <User size={16} />
              </div>
              <span className="profile-name-label">Juan Dela Cruz</span>
            </div>

            <button className="logout-action-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        {/* FORM TITLE BLOCK */}
        <div className="form-title-block">
          <h2 className="form-main-title">Application for Leave</h2>
          <p className="form-subtitle">Civil Service Form No. 6 Revised 2020</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* SECTION I — Personal and Office Information */}
          <section className="form-section-card">
            <h3 className="form-section-title">Section I: Personal and Office Information</h3>

            <div className="form-grid-2col">
              <div className="form-field">
                <label className="form-field-label">Office/Department</label>
                <select className="form-select-field" defaultValue="">
                  <option value="" disabled>Select department</option>
                  <option value="engineering">Engineering Office</option>
                  <option value="treasury">Treasury Office</option>
                  <option value="social-welfare">Social Welfare Office</option>
                  <option value="health">City Health Office</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-field-label">Position</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-field">
                <label className="form-field-label">Last Name</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>

              <div className="form-field">
                <label className="form-field-label">First Name</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>

              <div className="form-field">
                <label className="form-field-label">Middle Name</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-field">
                <label className="form-field-label">Date of Filing</label>
                <div className="form-input-icon-wrapper">
                  <input type="date" className="form-text-field" />
                  <Calendar size={16} className="form-input-icon" />
                </div>
              </div>

              <div className="form-field">
                <label className="form-field-label">Salary</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>
            </div>
          </section>

          {/* SECTION II — Details of Application */}
          <section className="form-section-card">
            <h3 className="form-section-title">Section II: Details of Application</h3>

            <div className="form-grid-2col">
              <div className="form-field">
                <label className="form-field-label">Types of Leave to be Availed Of:</label>
                <select
                  className="form-select-field"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="" disabled>Select leave type</option>
                  <option value="vacation">Vacation Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-field-label">Others:</label>
                <input type="text" className="form-text-field" placeholder="" />
              </div>
            </div>
          </section>

          {/* SECTION III — Specific Circumstances (highlighted, matches red-bordered card in prototype) */}
          <section className="form-section-card form-section-highlighted">
            <h3 className="form-section-title">
              Section III: Specific Circumstances <span className="form-section-subtitle">(Details of Leave)</span>
            </h3>

            <div className="form-field">
              <label className="form-field-label">
                Details for: [{leaveType ? leaveType.charAt(0).toUpperCase() + leaveType.slice(1) + ' Leave' : 'Type of Leave'}]
              </label>
              <textarea className="form-textarea-field" rows="3" placeholder=""></textarea>
            </div>
          </section>

          {/* SECTION IV — Duration and Commutation */}
          <section className="form-section-card">
            <h3 className="form-section-title">Section IV: Duration and Commutation</h3>

            <div className="form-grid-2col">
              <div className="form-field">
                <label className="form-field-label">Number of Working Days Applied For:</label>
                <input type="number" className="form-text-field" placeholder="" />
              </div>

              <div className="form-field">
                <label className="form-field-label">Inclusive Dates:</label>
                <div className="form-input-icon-wrapper">
                  <input type="date" className="form-text-field" />
                  <Calendar size={16} className="form-input-icon" />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field-label">Commutation:</label>
              <div className="form-checkbox-row">
                <label className="form-checkbox-label">
                  <input
                    type="radio"
                    name="commutation"
                    checked={commutation === 'not-requested'}
                    onChange={() => setCommutation('not-requested')}
                  />
                  <span>Not Requested</span>
                </label>
                <label className="form-checkbox-label">
                  <input
                    type="radio"
                    name="commutation"
                    checked={commutation === 'requested'}
                    onChange={() => setCommutation('requested')}
                  />
                  <span>Requested</span>
                </label>
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="form-action-row">
            <button type="button" className="form-btn-preview">Preview</button>
            <button type="submit" className="form-btn-submit">Submit</button>
            <button type="button" className="form-btn-cancel" onClick={handleCancel}>Cancel</button>
          </div>

        </form>

      </main>
    </div>
  );
}
