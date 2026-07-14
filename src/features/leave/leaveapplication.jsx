// src/LeaveApplication.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserCheck, History, CreditCard, GraduationCap, User, HelpCircle, Clock, Bell, Calendar } from 'lucide-react';
import './LeaveApplication.css';

export default function LeaveApplication({ user, onLogout }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const LEAVE_TYPES = [
    'Vacation Leave',
    'Mandatory/Forced Leave',
    'Sick Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Special Privilege Leave',
    'Solo Parent Leave',
    'Study Leave',
    '10-Day VAWC Leave',
    'Rehabilitation Privilege',
    'Special Leave Benefits for Women',
    'Special Emergency (Calamity) Leave',
    'Adoption Leave',
    'Others'
  ];

  // Editable fields only
  const [formData, setFormData] = useState({
    filingDate: new Date().toISOString().split('T')[0], // Defaults to today
    leaveType: '',
    otherLeaveType: '',
    workingDays: '',
    inclusiveDates: '',
    commutation: 'not-requested',
    specificCircumstances: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const payload = {
    employee_key: user.employee_key,
    department: user.department,
    position: user.position_title,
    salary: user.current_salary_amount, 
    leave_type: formData.leaveType,
    remarks: formData.specificCircumstances,
    working_days: formData.workingDays,
    start_date: formData.inclusiveDates,
    end_date: formData.inclusiveDates,
    status: 'Pending',
    // ADD THIS LINE:
    filingDate: formData.filingDate 
  };

  try {
      const response = await fetch('http://localhost:3001/api/leave/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      if (response.ok) {
          alert('Application submitted successfully.');
          navigate('/dashboard');
      }
  } catch (err) {
      alert('Submission failed.');
  }
};

  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });


  return (
    <div className="dashboard-container">

      {/* SIDEBAR NAVIGATION — identical structure to Dashboard.jsx for consistency */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/leaplogo.png" alt="LEAP-A Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item" onClick={() => navigate('/dashboard')}>
            <Home size={16} /> Dashboard
          </li>
          <li className="sidebar-item" onClick={() => navigate('/attendance')}>
            <UserCheck size={16} /> My Attendance
          </li>
          <li className="sidebar-item active" onClick={() => navigate('/leaveHistory')}>
            <History size={16} /> My Leave History
          </li>
          <li className="sidebar-item" onClick={() => navigate('/creditLedger')}>
            <CreditCard size={16} /> My Credit Ledger
          </li>
          <li className="sidebar-item" onClick={() => navigate('/training')}>
            <GraduationCap size={16} /> My Training Records
          </li>
          <li className="sidebar-item" onClick={() => navigate('/profile')}>
            <User size={16} /> My Profile
          </li>
          <li className="sidebar-item" onClick={() => navigate('/support')}>
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
              <span className="profile-name-label">
                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Employee Name'}
              </span>
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

        <form onSubmit={handleSubmit} className="official-form-layout">
          
          {/* SECTION 1-5: PERSONAL INFORMATION (READ ONLY) */}
          <section className="form-section-card">
            <div className="form-grid-3col">
              <div className="form-field">
                <label className="form-field-label">1. Office/Department</label>
                <input type="text" className="form-text-field read-only" value={user.department || ''} readOnly />
              </div>
              <div className="form-field">
                <label className="form-field-label">4. Position</label>
                <input type="text" className="form-text-field read-only" value={user.position_title || ''} readOnly />
              </div>
              <div className="form-field">
                <label className="form-field-label">5. Salary</label>
                <input 
                  type="text" 
                  className="form-text-field read-only" 
                  value={user.current_salary_amount ? `₱${Number(user.current_salary_amount).toLocaleString()}` : '0.00'} 
                  readOnly 
                />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-field">
                <label className="form-field-label">2. Last Name</label>
                <input type="text" className="form-text-field read-only" value={user.last_name || ''} readOnly />
              </div>
              <div className="form-field">
                <label className="form-field-label">First Name</label>
                <input type="text" className="form-text-field read-only" value={user.first_name || ''} readOnly />
              </div>
              <div className="form-field">
                <label className="form-field-label">Middle Name</label>
                <input type="text" className="form-text-field read-only" value={user.middle_name || ''} readOnly />
              </div>
            </div>

            <div className="form-field">
              <label className="form-field-label">3. Date of Filing</label>
              <input name="filingDate" type="date" className="form-text-field" value={formData.filingDate} onChange={handleChange} required />
            </div>
          </section>

          {/* SECTION 6: DETAILS OF APPLICATION */}
<section className="form-section-card">
  <h3 className="form-section-title">6. DETAILS OF APPLICATION</h3>
  
  <div className="form-field">
    <label className="form-field-label">6.A Type of Leave to be Availed Of</label>
    <select 
      name="leaveType" 
      className="form-select-field" 
      value={formData.leaveType} // Set the value here
      onChange={handleChange} 
      required
    >
      <option value="" disabled>Select Leave Type</option>
      {LEAVE_TYPES.map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  </div>

  <div className="form-field">
    <label className="form-field-label">6.B Details of Leave (Specifics)</label>
    <textarea 
      name="specificCircumstances" 
      className="form-textarea-field" 
      value={formData.specificCircumstances}
      onChange={handleChange} 
      placeholder="e.g., In-Hospital, Abroad, etc."
    ></textarea>
  </div>

  <div className="form-grid-2col">
    <div className="form-field">
      <label className="form-field-label">6.C Number of Working Days</label>
      <input 
        name="workingDays" 
        type="number" 
        className="form-text-field" 
        value={formData.workingDays}
        onChange={handleChange} 
        required 
      />
    </div>
    <div className="form-field">
      <label className="form-field-label">Inclusive Dates</label>
      <input 
        name="inclusiveDates" 
        type="date" 
        className="form-text-field" 
        value={formData.inclusiveDates}
        onChange={handleChange} 
        required 
      />
    </div>
  </div>

            <div className="form-field">
              <label className="form-field-label">6.D Commutation</label>
              <div className="form-checkbox-row">
                <label><input type="radio" name="commutation" value="not-requested" checked={formData.commutation === 'not-requested'} onChange={handleChange} /> Not Requested</label>
                <label><input type="radio" name="commutation" value="requested" checked={formData.commutation === 'requested'} onChange={handleChange} /> Requested</label>
              </div>
            </div>
          </section>

          <div className="form-action-row">
            <button type="submit" className="form-btn-submit">Submit Application</button>
            <button type="button" className="form-btn-cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}