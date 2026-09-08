// src/features/leave/LeaveApplication.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, UserCheck, Plane, Stethoscope, GraduationCap, Layers, Send, Eye } from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import LeavePreviewModal from "./leave-preview-modal";
import './leaveapplication.css';

export default function LeaveApplication({ user, onLogout }) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

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

  const [formData, setFormData] = useState({
    filingDate: new Date().toISOString().split('T')[0],
    leaveType: '',
    othersSpecify: '',
    vacationSplLocation: '',
    abroadSpecify: '',
    sickLeaveType: '',
    illnessSpecify: '',
    studyLeavePurpose: '',
    othersPurpose: '',
    workingDays: '',
    inclusiveDateFrom: '',
    inclusiveDateTo: '',
    commutation: 'not-requested'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const submitApplication = async () => {
    const payload = {
      employee_key: user?.employee_key,
      department: user?.department,
      position: user?.position_title,
      salary: user?.current_salary_amount,
      leave_type: formData.leaveType,
      others_specify: formData.othersSpecify,
      vacation_spl_location: formData.vacationSplLocation,
      abroad_specify: formData.abroadSpecify,
      sick_leave_type: formData.sickLeaveType,
      illness_specify: formData.illnessSpecify,
      study_leave_purpose: formData.studyLeavePurpose,
      others_purpose: formData.othersPurpose,
      working_days: formData.workingDays,
      start_date: formData.inclusiveDateFrom,
      end_date: formData.inclusiveDateTo,
      commutation: formData.commutation,
      status: 'Pending',
      filingDate: formData.filingDate
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/leave/apply`, {
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const showVacationSpl = formData.leaveType === 'Vacation Leave' || formData.leaveType === 'Special Privilege Leave';
  const showSickLeave = formData.leaveType === 'Sick Leave';
  const showSpecialWomen = formData.leaveType === 'Special Leave Benefits for Women';
  const showStudyLeave = formData.leaveType === 'Study Leave';
  const showOthers = formData.leaveType === 'Others';
  const hasSixBFields = showVacationSpl || showSickLeave || showSpecialWomen || showStudyLeave || showOthers;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="leave-app-main">
        <div className="leave-app-wrapper">
          <button type="button" className="leave-back-link" onClick={handleCancel}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <header className="form-title-block">
            <div className="form-title-wrapper">
              <h2 className="form-main-title">Application for Leave</h2>
              <span className="form-badge">CS Form No. 6 (Revised 2020)</span>
            </div>
            <p className="form-subtitle">Fill out the required information to process your official leave application.</p>
          </header>

          <form onSubmit={handleFormSubmit} className="official-form-layout">
            
            {/* SECTION 1: APPLICANT DETAILS */}
            <section className="form-section-card form-section-readonly">
              <div className="card-header">
                <UserCheck className="card-header-icon" size={18} />
                <h3 className="form-section-title">1. Applicant Profile</h3>
              </div>

              <div className="form-grid-3col">
                <div className="info-display-tile">
                  <span className="tile-label">Office / Department</span>
                  <span className="tile-value">{user?.department || '—'}</span>
                </div>
                <div className="info-display-tile">
                  <span className="tile-label">Position</span>
                  <span className="tile-value">{user?.position_title || '—'}</span>
                </div>
                <div className="info-display-tile">
                  <span className="tile-label">Monthly Salary</span>
                  <span className="tile-value highlight">
                    {user?.current_salary_amount ? `₱${Number(user.current_salary_amount).toLocaleString()}` : '₱0.00'}
                  </span>
                </div>
              </div>

              <div className="form-grid-3col">
                <div className="info-display-tile">
                  <span className="tile-label">Last Name</span>
                  <span className="tile-value">{user?.last_name || '—'}</span>
                </div>
                <div className="info-display-tile">
                  <span className="tile-label">First Name</span>
                  <span className="tile-value">{user?.first_name || '—'}</span>
                </div>
                <div className="info-display-tile">
                  <span className="tile-label">Middle Name</span>
                  <span className="tile-value">{user?.middle_name || '—'}</span>
                </div>
              </div>

              <div className="form-field form-field-narrow" style={{ marginTop: '16px' }}>
                <label className="form-field-label">Date of Filing</label>
                <div className="form-input-icon-wrapper">
                  <input
                    name="filingDate"
                    type="date"
                    className="form-text-field"
                    value={formData.filingDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: LEAVE DETAILS */}
            <section className="form-section-card">
              <div className="card-header">
                <FileText className="card-header-icon" size={18} />
                <h3 className="form-section-title">2. Details of Application</h3>
              </div>

              <div className="form-grid-2col">
                <div className="form-field">
                  <label className="form-field-label">Type of Leave Requested</label>
                  <select
                    name="leaveType"
                    className="form-select-field"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select Leave Type...</option>
                    {LEAVE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  {showOthers && (
                    <div className="form-field" style={{ marginTop: '12px' }}>
                      <label className="form-field-label">Specify Other Leave Type</label>
                      <input
                        name="othersSpecify"
                        type="text"
                        className="form-text-field"
                        value={formData.othersSpecify}
                        onChange={handleChange}
                        placeholder="e.g. Bereavement, Emergency"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* DYNAMIC DETAILS PANEL */}
                <div className="dynamic-details-panel">
                  <label className="form-field-label">Additional Requirements</label>

                  {!hasSixBFields && (
                    <div className="form-hint-box">
                      Select a leave type on the left to complete specific details.
                    </div>
                  )}

                  {showVacationSpl && (
                    <div className="form-subgroup">
                      <p className="form-subgroup-label"><Plane size={14} /> Vacation Location</p>
                      <div className="form-checkbox-row">
                        <label className={`radio-card ${formData.vacationSplLocation === 'within-ph' ? 'selected' : ''}`}>
                          <input type="radio" name="vacationSplLocation" value="within-ph" checked={formData.vacationSplLocation === 'within-ph'} onChange={handleChange} />
                          <span>Within Philippines</span>
                        </label>
                        <label className={`radio-card ${formData.vacationSplLocation === 'abroad' ? 'selected' : ''}`}>
                          <input type="radio" name="vacationSplLocation" value="abroad" checked={formData.vacationSplLocation === 'abroad'} onChange={handleChange} />
                          <span>Abroad</span>
                        </label>
                      </div>
                      {formData.vacationSplLocation === 'abroad' && (
                        <input
                          name="abroadSpecify"
                          type="text"
                          className="form-text-field form-subgroup-input"
                          value={formData.abroadSpecify}
                          onChange={handleChange}
                          placeholder="Specify destination country"
                          required
                        />
                      )}
                    </div>
                  )}

                  {showSickLeave && (
                    <div className="form-subgroup">
                      <p className="form-subgroup-label"><Stethoscope size={14} /> Medical Location & Illness</p>
                      <div className="form-checkbox-row">
                        <label className={`radio-card ${formData.sickLeaveType === 'in-hospital' ? 'selected' : ''}`}>
                          <input type="radio" name="sickLeaveType" value="in-hospital" checked={formData.sickLeaveType === 'in-hospital'} onChange={handleChange} />
                          <span>In Hospital</span>
                        </label>
                        <label className={`radio-card ${formData.sickLeaveType === 'out-patient' ? 'selected' : ''}`}>
                          <input type="radio" name="sickLeaveType" value="out-patient" checked={formData.sickLeaveType === 'out-patient'} onChange={handleChange} />
                          <span>Out Patient</span>
                        </label>
                      </div>
                      <input
                        name="illnessSpecify"
                        type="text"
                        className="form-text-field form-subgroup-input"
                        value={formData.illnessSpecify}
                        onChange={handleChange}
                        placeholder="Specify illness / diagnosis"
                        required
                      />
                    </div>
                  )}

                  {showSpecialWomen && (
                    <div className="form-subgroup">
                      <p className="form-subgroup-label"><Stethoscope size={14} /> Medical Details</p>
                      <input
                        name="illnessSpecify"
                        type="text"
                        className="form-text-field form-subgroup-input"
                        value={formData.illnessSpecify}
                        onChange={handleChange}
                        placeholder="Specify medical illness / condition"
                        required
                      />
                    </div>
                  )}

                  {showStudyLeave && (
                    <div className="form-subgroup">
                      <p className="form-subgroup-label"><GraduationCap size={14} /> Study Purpose</p>
                      <div className="form-checkbox-row stacked">
                        <label className={`radio-card ${formData.studyLeavePurpose === 'masters' ? 'selected' : ''}`}>
                          <input type="radio" name="studyLeavePurpose" value="masters" checked={formData.studyLeavePurpose === 'masters'} onChange={handleChange} />
                          <span>Completion of Master's Degree</span>
                        </label>
                        <label className={`radio-card ${formData.studyLeavePurpose === 'bar-board' ? 'selected' : ''}`}>
                          <input type="radio" name="studyLeavePurpose" value="bar-board" checked={formData.studyLeavePurpose === 'bar-board'} onChange={handleChange} />
                          <span>BAR / Board Exam Review</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {showOthers && (
                    <div className="form-subgroup">
                      <p className="form-subgroup-label"><Layers size={14} /> Purpose</p>
                      <div className="form-checkbox-row stacked">
                        <label className={`radio-card ${formData.othersPurpose === 'monetization' ? 'selected' : ''}`}>
                          <input type="radio" name="othersPurpose" value="monetization" checked={formData.othersPurpose === 'monetization'} onChange={handleChange} />
                          <span>Monetization of Leave Credits</span>
                        </label>
                        <label className={`radio-card ${formData.othersPurpose === 'terminal-leave' ? 'selected' : ''}`}>
                          <input type="radio" name="othersPurpose" value="terminal-leave" checked={formData.othersPurpose === 'terminal-leave'} onChange={handleChange} />
                          <span>Terminal Leave</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DATES & DAYS */}
              <div className="form-grid-2col" style={{ marginTop: '24px' }}>
                <div className="form-field">
                  <label className="form-field-label">Working Days Applied For</label>
                  <input
                    name="workingDays"
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="form-text-field"
                    placeholder="e.g. 5"
                    value={formData.workingDays}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-field-label">Inclusive Dates</label>
                  <div className="date-range-row">
                    <input
                      name="inclusiveDateFrom"
                      type="date"
                      className="form-text-field"
                      value={formData.inclusiveDateFrom}
                      onChange={handleChange}
                      required
                    />
                    <span className="date-range-sep">to</span>
                    <input
                      name="inclusiveDateTo"
                      type="date"
                      className="form-text-field"
                      value={formData.inclusiveDateTo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* COMMUTATION */}
              <div className="form-field" style={{ marginTop: '24px' }}>
                <label className="form-field-label">Commutation Option</label>
                <div className="form-checkbox-row">
                  <label className={`radio-card ${formData.commutation === 'not-requested' ? 'selected' : ''}`}>
                    <input type="radio" name="commutation" value="not-requested" checked={formData.commutation === 'not-requested'} onChange={handleChange} />
                    <span>Not Requested</span>
                  </label>
                  <label className={`radio-card ${formData.commutation === 'requested' ? 'selected' : ''}`}>
                    <input type="radio" name="commutation" value="requested" checked={formData.commutation === 'requested'} onChange={handleChange} />
                    <span>Requested</span>
                  </label>
                </div>
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div className="form-action-row">
              <button type="button" className="form-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <div className="primary-actions">
                <button 
                  type="button" 
                  className="form-btn-preview" 
                  onClick={() => setShowPreview(true)}
                >
                  <Eye size={16} /> Preview
                </button>
                <button type="submit" className="form-btn-submit">
                  <Send size={16} /> Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {showPreview && (
        <LeavePreviewModal
          formData={formData}
          user={user}
          onClose={() => setShowPreview(false)}
          onConfirm={submitApplication}
        />
      )}
    </div>
  );
}