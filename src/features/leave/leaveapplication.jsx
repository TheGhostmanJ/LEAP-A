// src/features/leave/LeaveApplication.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, UserCheck, Plane, Stethoscope, GraduationCap, Layers, Send, Eye, AlertCircle, Paperclip, CheckCircle, Loader2 } from 'lucide-react';
import Sidebar from '../../components/sidebar.jsx';
import LeavePreviewModal from "./leave-preview-modal";
import UnsavedChangesModal from "./unsavedchangesmodal";
import { buildLeavePdfBytes } from './generateLeavePdf';
import { leaveService } from '../../services/leaveService';
import { validateCSCApplication } from './cscRules.js';
import './leaveapplication.css';

export default function LeaveApplication({ user, onLogout }) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // From User's version
  
  // Modal & Draft States from Groupmate
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

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

  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem('leave_application_draft');
    return savedDraft ? JSON.parse(savedDraft) : {
      filingDate: todayStr,
      leaveType: '',
      othersSpecify: '',
      vacationSplLocation: '',
      abroadSpecify: '',
      sickLeaveType: '',
      illnessSpecify: '',
      studyLeavePurpose: '',
      othersPurpose: '',
      workingDays: '',
      inclusiveDateFrom: todayStr,
      inclusiveDateTo: todayStr,
      commutation: 'not-requested'
    };
  });

  useEffect(() => {
    async function fetchCredits() {
      if (user?.employee_key && leaveService?.getUserCredits) {
        try {
          const credits = await leaveService.getUserCredits(user.employee_key);
          setUserCredits(credits);
        } catch (err) {
          console.error('Failed to load leave credits:', err);
        }
      }
    }
    fetchCredits();
  }, [user]);

  const cscValidation = validateCSCApplication(formData, userCredits);

  const activeRequiredDocs = cscValidation.requiredDocs || cscValidation.requiredFiles || [];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Sync End Date based on Working Days
  const calculateEndDate = (startDateStr, daysCount) => {
    if (!startDateStr || !daysCount || daysCount <= 0) return startDateStr;
    let currentDate = new Date(startDateStr);
    let addedDays = 0;
    const targetDays = Math.ceil(parseFloat(daysCount));

    while (addedDays < targetDays - 1) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }
    return currentDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.inclusiveDateFrom && formData.workingDays) {
      const computedEndDate = calculateEndDate(formData.inclusiveDateFrom, formData.workingDays);
      setFormData((prev) => ({ ...prev, inclusiveDateTo: computedEndDate }));
    }
  }, [formData.inclusiveDateFrom, formData.workingDays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (docLabel, file) => {
    if (!file) {
      setAttachedFiles((prev) => {
        const next = { ...prev };
        delete next[docLabel];
        return next;
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`"${file.name}" exceeds the maximum allowed limit of 5MB.`);
      return;
    }

    setIsDirty(true);
    setAttachedFiles((prev) => ({ ...prev, [docLabel]: file }));
  };

  const fileToBase64Async = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          base64Data: base64
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleNavigateAway = (targetPath = '/dashboard') => {
    if (isDirty) {
      setPendingNavigation(targetPath);
      setShowUnsavedModal(true);
    } else {
      navigate(targetPath);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('leave_application_draft', JSON.stringify(formData));
    setIsDirty(false);
    setShowUnsavedModal(false);
    alert('Draft saved successfully.');
    if (pendingNavigation) navigate(pendingNavigation);
  };

  const handleDiscardChanges = () => {
    localStorage.removeItem('leave_application_draft');
    setIsDirty(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) navigate(pendingNavigation);
  };

  const uint8ToBase64Async = (uint8Array) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // USER'S FIX: The main submission sequence hitting your local Express API
  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      // Process attachments into Base64
      const processedAttachments = [];
      for (const [requirement, fileObj] of Object.entries(attachedFiles)) {
        if (fileObj) {
          const encoded = await fileToBase64Async(fileObj);
          processedAttachments.push({ requirementLabel: requirement, ...encoded });
        }
      }

      // Generate the CS Form PDF if the helper exists
      let pdfBase64 = null;
      if (typeof buildLeavePdfBytes === 'function') {
        const pdfBytes = await buildLeavePdfBytes(formData, user);
        pdfBase64 = await uint8ToBase64Async(pdfBytes);
      }

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
        filingDate: formData.filingDate,
        attachments: processedAttachments,
        pdf_document: pdfBase64
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/leave/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        localStorage.removeItem('leave_application_draft'); 
        setIsDirty(false);
        alert('Application submitted successfully.');
        navigate('/dashboard'); 
      } else {
        const errorData = await response.json();
        alert(`Submission failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to process submission:', err);
      alert('Error processing application submission. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // USER'S FIX: Triggers validation, then fires API (Bypasses Preview Modal)
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (showVacationSpl && !formData.vacationSplLocation) {
      alert('Please select a location for Vacation/Special Privilege Leave.');
      return;
    }
    if (showSickLeave && !formData.sickLeaveType) {
      alert('Please select Sick Leave type (In Hospital / Out Patient).');
      return;
    }

    if (cscValidation.errors && cscValidation.errors.length > 0) {
      alert(`CSC Rule Non-Compliance:\n\n• ${cscValidation.errors.join('\n• ')}`);
      return;
    }

    const missingDocs = activeRequiredDocs.filter((doc) => !attachedFiles[doc]);
    if (missingDocs.length > 0) {
      alert(`Please upload all required supporting attachments:\n\n• ${missingDocs.join('\n• ')}`);
      return;
    }

    submitApplication(); 
  };

  const showVacationSpl = formData.leaveType === 'Vacation Leave' || formData.leaveType === 'Special Privilege Leave';
  const showSickLeave = formData.leaveType === 'Sick Leave';
  const showSpecialWomen = formData.leaveType === 'Special Leave Benefits for Women';
  const showStudyLeave = formData.leaveType === 'Study Leave';
  const showOthers = formData.leaveType === 'Others';
  const hasSixBFields = showVacationSpl || showSickLeave || showSpecialWomen || showStudyLeave || showOthers;

  return (
    <div className="dashboard-container">
      <Sidebar onNavigate={handleNavigateAway} />

      <main className="leave-app-main">
        <div className="leave-app-wrapper">
          <button type="button" className="leave-back-link" onClick={() => handleNavigateAway('/dashboard')}>
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
                <label className="form-field-label">Date of Filing <span className="req-asterisk">*</span></label>
                <div className="form-input-icon-wrapper">
                  <input
                    name="filingDate"
                    type="date"
                    className="form-text-field"
                    min={todayStr}
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
                  <label className="form-field-label">Type of Leave Requested <span className="req-asterisk">*</span></label>
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
                      <label className="form-field-label">Specify Other Leave Type <span className="req-asterisk">*</span></label>
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
                      <p className="form-subgroup-label"><Plane size={14} /> Vacation Location <span className="req-asterisk">*</span></p>
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
                      <p className="form-subgroup-label"><Stethoscope size={14} /> Medical Location & Illness <span className="req-asterisk">*</span></p>
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
                      <p className="form-subgroup-label"><Stethoscope size={14} /> Medical Details <span className="req-asterisk">*</span></p>
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
                      <p className="form-subgroup-label"><GraduationCap size={14} /> Study Purpose <span className="req-asterisk">*</span></p>
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
                      <p className="form-subgroup-label"><Layers size={14} /> Purpose <span className="req-asterisk">*</span></p>
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
                  <label className="form-field-label">Working Days Applied For <span className="req-asterisk">*</span></label>
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
                  <label className="form-field-label">Inclusive Dates <span className="req-asterisk">*</span></label>
                  <div className="date-range-row">
                    <input
                      name="inclusiveDateFrom"
                      type="date"
                      className="form-text-field"
                      min={todayStr}
                      value={formData.inclusiveDateFrom}
                      onChange={handleChange}
                      required
                    />
                    <span className="date-range-sep">to</span>
                    <input
                      name="inclusiveDateTo"
                      type="date"
                      className="form-text-field"
                      min={formData.inclusiveDateFrom || todayStr}
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

              {/* CSC RULES dynamic feedback section */}
              {cscValidation.errors && cscValidation.errors.length > 0 && (
                <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    <AlertCircle size={16} /> CSC Rule Non-Compliance Warnings
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#B91C1C', fontSize: '13px' }}>
                    {cscValidation.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* REQUIRED ATTACHMENTS FILE UPLOAD BOX */}
              {activeRequiredDocs.length > 0 && (
                <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    <Paperclip size={16} /> Required Supporting Attachments (CS Form No. 6)
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#1D4ED8', fontSize: '13px' }}>
                    Please attach mandatory document(s) in PDF, PNG, or JPG format (Max 5MB each).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeRequiredDocs.map((doc, idx) => (
                      <div key={idx} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A8A' }}>
                            {doc} <span style={{ color: '#EF4444' }}>*</span>
                          </span>
                          {attachedFiles[doc] && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: 500 }}>
                              <CheckCircle size={14} /> Attached
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(doc, e.target.files[0])}
                          style={{ fontSize: '12px', width: '100%' }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ACTION BUTTONS */}
            <div className="form-action-row">
              <button type="button" className="form-btn-cancel" onClick={() => handleNavigateAway('/dashboard')}>
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
                <button type="submit" className="form-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={16} className="spinner" /> : <Send size={16} />} 
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
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

      {showUnsavedModal && (
        <UnsavedChangesModal
          onKeepEditing={() => setShowUnsavedModal(false)}
          onDiscard={handleDiscardChanges}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
}